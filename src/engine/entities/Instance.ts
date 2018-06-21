import Renderer from '../Renderer';
import Camera from './Camera';
import Scene from '../Scene';
import Geometry from '../geometries/Geometry';
import Material from '../materials/Material';
import Component from '../Component';
import Matrix3 from '../math/Matrix3';
import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import Vector4 from '../math/Vector4';
import Quaternion from '../math/Quaternion';
import { createUUID } from '../Utils';
import PointLight from '../lights/PointLight';
import Armature from '../animation/Armature';
import Animator from '../animation/Animator';
import AnimatorBaked from '../animation/AnimatorBaked';

class Instance {
    protected _geometry           : Geometry;
    protected _material           : Material;
    protected _transform          : Matrix4;
    protected _worldMatrix        : Matrix4;
    protected _normalMatrix       : Matrix3;
    protected _scene              : Scene;
    protected _components         : Array<Component>;
    protected _destroyed          : boolean;
    protected _needsUpdate        : boolean;
    protected _parent             : Instance;
    protected _children           : Array<Instance>
    protected _lightLayers        : Array<number>;
    protected _globalPosition     : Vector4;
    protected _armature           : Armature;

    public readonly id                  : string;
    public readonly position            : Vector3;
    public readonly rotation            : Quaternion;
    public readonly scale               : Vector3;
    
    constructor(geometry: Geometry = null, material: Material = null) {
        this.id = createUUID();

        this._transform = Matrix4.createIdentity();
        this._worldMatrix = Matrix4.createIdentity();
        this._normalMatrix = Matrix3.createIdentity();
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._scene = null;
        this._components = [];
        this._children = [];
        this._parent = null;
        this._destroyed = false;
        this._lightLayers = [0];
        this._globalPosition = new Vector4(0.0, 0.0, 0.0, 0.0);
        this._armature = null;

        this.position = new Vector3(0.0);
        this.position.onChange = () => this.emmitNeedsUpdate();

        this.rotation = new Quaternion();
        this.rotation.onChange = () => this.emmitNeedsUpdate();

        this.scale = new Vector3(1.0, 1.0, 1.0);
        this.scale.onChange = () => this.emmitNeedsUpdate();
    }
    
    public setScene(scene: Scene): void {
        this._scene = scene;
    }

    public addComponent(component: Component): void {
        this._components.push(component);
        component.addInstance(this);
    }

    public getComponent<T>(componentName: string): T {
        for (let i=0,comp;comp=this._components[i];i++) {
            if (comp.name == componentName) {
                return <T>(<any>comp);
            }
        }

        return null;
    }
    
    public getTransformation(): Matrix4 {
        if (!this._needsUpdate) {
            return this._transform;
        }

        this._transform.setScale(this.scale.x, this.scale.y, this.scale.z);

        this._transform.multiply(this.rotation.getRotationMatrix());

        this._transform.translate(this.position.x, this.position.y, this.position.z);

        if (this._parent) {
            this._transform.multiply(this._parent.getTransformation());
        }

        this._normalMatrix.setFromMatrix4(this._transform).invert().transpose();

        this._needsUpdate = false;

        return this._transform;
    }

    public clear(): void {
        this.position.set(0, 0, 0);
        this.rotation.setIdentity();
        this._transform.setIdentity();
        this._worldMatrix.setIdentity();
        this._normalMatrix.setIdentity();
        this._geometry = null;
        this._material = null;
        this._needsUpdate = true;
        this._scene = null;
        this._components = [];
        this._destroyed = true;
    }

    public awake(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.awake();
        };
    }

    public update(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.update();
        };

        if (this._armature) {
            this._armature.update();
        }
    }

    public destroy(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.destroy();
        };

        this._destroyed = true;
    }

    public render(renderer: Renderer, camera: Camera): void {
        if (!this._geometry || !this._material) { return; }
        if (!this._material.isReady) { return; }

        this._worldMatrix.copy(this.getTransformation());
        this._worldMatrix.multiply(camera.getViewMatrix());

        this._material.render(renderer, this, this._scene, camera);
    }

    public addChild(instance: Instance): void {
        instance.removeParent();

        this._children.push(instance);
        instance._parent = this;

        const p = this.position;
        instance.position.add(-p.x, -p.y, -p.z);
    }

    public removeChild(instance: Instance): boolean {
        for (let i=0,child;child=this._children[i];i++) {
            if (child.id == instance.id) {
                this._children.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    public removeParent(): void {
        if (!this._parent) { return; }

        const p = this.globalPosition;
        this.position.set(p.x, p.y, p.z);

        this.rotation.copy(this.globalRotation);

        this._parent.removeChild(this);
        this._parent = null;
    }

    public getIntersectingLights(): Array<PointLight> {
        if (!this._geometry) { return []; }

        let ret: Array<PointLight> = [];
        const lights = this._scene.lights,
            bb = this._geometry.boundingBox;

        for (let i=0,light;light=lights[i];i++) {
            if (this._lightLayers.indexOf(light.layer) == -1) { continue; }

            const r = light.radius,
                pos = light.globalPosition,
                x1 = pos.x - r,
                x2 = pos.x + r,
                y1 = pos.y - r,
                y2 = pos.y + r,
                z1 = pos.z - r,
                z2 = pos.z + r; 

            if (bb[0] >= x2 || bb[3] < x1 || bb[1] >= y2 || bb[4] < y1 || bb[2] >= z2 || bb[5] < z1) {
                continue;
            }

            ret.push(light);
        }
        
        return ret;
    }

    public addLightLayer(layer: number): Instance {
        if (this._lightLayers.indexOf(layer) == -1) {
            this._lightLayers.push(layer);
        }

        return this;
    }

    public removeLightLayer(layer: number): Instance {
        const ind = this._lightLayers.indexOf(layer);
        if (ind != -1) {
            this._lightLayers.splice(ind, 1);
        }

        return this;
    }

    public get worldMatrix(): Matrix4 {
        return this._worldMatrix;
    }

    public get normalMatrix(): Matrix3 {
        this.getTransformation();
        
        return this._normalMatrix;
    }

    public get geometry(): Geometry {
        return this._geometry;
    }
    
    public get material(): Material {
        return this._material;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public get isDestroyed(): boolean {
        return this._destroyed;
    }

    public get needsUpdate(): boolean {
        return this._needsUpdate;
    }

    public get globalPosition(): Vector3 {
        if (!this._parent) { return this.position; }
        
        return this._globalPosition.xyz;
    }

    public get globalRotation(): Quaternion {
        if (!this._parent) { return this.rotation; }

        return this.rotation.clone().multiplyQuaternion(this._parent.globalRotation);
    }

    public set armature(armature: Armature) {
        (armature != null)? this._material.addConfig("USE_SKIN") : this._material.removeConfig("USE_SKIN");

        this._armature = armature;
    }

    public get armature(): Armature {
        return this._armature;
    }

    public set animator(animator: Animator|AnimatorBaked) {
        ((<AnimatorBaked>animator).texture)? this._material.addConfig("USE_BAKED_ANIMATIONS") : this._material.removeConfig("USE_BAKED_ANIMATIONS");

        this._armature.animation = animator;
    }

    public emmitNeedsUpdate(): void {
        for (let i=0,child;child=this._children[i];i++) {
            child.emmitNeedsUpdate();
        }
        
        if (this._parent) {
            this._globalPosition.set(this.position.x, this.position.y, this.position.z, 1)
            const t = this._parent.getTransformation();
            this._globalPosition = t.multiplyVector(this._globalPosition);
        }

        this._needsUpdate = true;
    }
}

export default Instance;