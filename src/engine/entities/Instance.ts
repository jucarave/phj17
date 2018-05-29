import Renderer from '../Renderer';
import Camera from './Camera';
import Scene from '../Scene';
import Geometry from '../geometries/Geometry';
import Material from '../materials/Material';
import Component from '../Component';
import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import Vector4 from '../math/Vector4';
import Quaternion from '../math/Quaternion';
import { createUUID } from '../Utils';

class Instance {
    protected _geometry           : Geometry;
    protected _material           : Material;
    protected _transform          : Matrix4;
    protected _worldMatrix        : Matrix4;
    protected _scene              : Scene;
    protected _components         : Array<Component>;
    protected _destroyed          : boolean;
    protected _needsUpdate        : boolean;
    protected _parent             : Instance;
    protected _children           : Array<Instance>
    
    public readonly id                  : string;
    public readonly position            : Vector3;
    public readonly rotation            : Quaternion;
    
    constructor(geometry: Geometry = null, material: Material = null) {
        this.id = createUUID();

        this._transform = Matrix4.createIdentity();
        this._worldMatrix = Matrix4.createIdentity();
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._scene = null;
        this._components = [];
        this._children = [];
        this._parent = null;
        this._destroyed = false;

        this.position = new Vector3(0.0);
        this.position.onChange = () => this.emmitNeedsUpdate();

        this.rotation = new Quaternion();
        this.rotation.onChange = () => this.emmitNeedsUpdate();
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

        this._transform.copy(this.rotation.getRotationMatrix());

        this._transform.translate(this.position.x, this.position.y, this.position.z);

        if (this._parent) {
            this._transform.multiply(this._parent.getTransformation());
        }

        this._needsUpdate = false;

        return this._transform;
    }

    public clear(): void {
        this.position.set(0, 0, 0);
        this.rotation.setIdentity();
        this._transform.setIdentity();
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
    }

    public destroy(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.destroy();
        };

        this._geometry.destroy();

        this._destroyed = true;
    }

    public render(renderer: Renderer, camera: Camera): void {
        if (!this._geometry || !this._material) { return; }
        if (!this._material.isReady) { return; }

        this._worldMatrix.copy(this.getTransformation());
        this._worldMatrix.multiply(camera.getViewMatrix());

        this._material.render(renderer, this, camera);
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

    public get worldMatrix(): Matrix4 {
        return this._worldMatrix;
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
        
        const t = this._parent.getTransformation();
        const p = t.multiplyVector(new Vector4(this.position.x, this.position.y, this.position.z, 1));

        return p.xyz;
    }

    public get globalRotation(): Quaternion {
        if (!this._parent) { return this.rotation; }

        return this.rotation.clone().multiplyQuaternion(this._parent.globalRotation);
    }

    public emmitNeedsUpdate(): void {
        for (let i=0,child;child=this._children[i];i++) {
            child.emmitNeedsUpdate();
        }

        this._needsUpdate = true;
    }
}

export default Instance;