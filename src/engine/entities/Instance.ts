import Renderer from '../Renderer';
import Camera from '../Camera';
import Scene from '../Scene';
import Geometry from '../geometries/Geometry';
import Material from '../materials/Material';
import Component from '../Component';
import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import { get2DAngle } from '../Utils';
import List from '../List';

class Instance {
    protected _geometry           : Geometry;
    protected _material           : Material;
    protected _transform          : Matrix4;
    protected _worldMatrix        : Matrix4;
    protected _scene              : Scene;
    protected _components         : List<Component>;
    protected _destroyed          : boolean;
    protected _needsUpdate        : boolean;
    
    public readonly position            : Vector3;
    public readonly rotation            : Vector3;

    public isBillboard         : boolean;
    
    constructor(geometry: Geometry = null, material: Material = null) {
        this._transform = Matrix4.createIdentity();
        this._worldMatrix = Matrix4.createIdentity();
        this.isBillboard = false;
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._scene = null;
        this._components = new List();
        this._destroyed = false;

        this.position = new Vector3(0.0);
        this.position.onChange = () => this._needsUpdate = true;

        this.rotation = new Vector3(0.0);
        this.rotation.onChange = () => this._needsUpdate = true;
    }
    
    public setScene(scene: Scene): void {
        this._scene = scene;
    }

    public addComponent(component: Component): void {
        this._components.push(component);
        component.addInstance(this);
    }

    public getComponent<T>(componentName: string): T {
        for (let i=0,comp;comp=this._components.getAt(i);i++) {
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

        this._transform.setIdentity();

        this._transform.multiply(Matrix4.createXRotation(this.rotation.x));
        this._transform.multiply(Matrix4.createZRotation(this.rotation.z));
        this._transform.multiply(Matrix4.createYRotation(this.rotation.y));

        let offset = this._geometry.offset;
        this._transform.translate(this.position.x + offset.x, this.position.y + offset.y, this.position.z + offset.z);

        this._needsUpdate = false;

        return this._transform;
    }

    public clear(): void {
        this.position.set(0, 0, 0);
        this.rotation.set(0, 0, 0);
        this._transform.setIdentity();
        this._geometry = null;
        this._material = null;
        this.isBillboard = false;
        this._needsUpdate = true;
        this._scene = null;
        this._components.clear();
        this._destroyed = true;
    }

    public awake(): void {
        this._components.each((component: Component) => {
            component.awake();
        });
    }

    public update(): void {
        this._components.each((component: Component) => {
            component.update();
        });
    }

    public destroy(): void {
        this._components.each((component: Component) => {
            component.destroy();
        });

        this._geometry.destroy();

        this._destroyed = true;
    }

    public render(renderer: Renderer, camera: Camera): void {
        if (!this._geometry || !this._material) { return; }
        if (!this._material.isReady) { return; }

        this._material.shader.useProgram(renderer);

        const gl = renderer.GL,
            shader = this._material.shader,
            program = shader.getProgram(renderer);

        if (this.isBillboard) {
            this.rotation.set(0, get2DAngle(this.position, camera.position) + Math.PI / 2, 0);
        }

        this._worldMatrix.copy(this.getTransformation());
        this._worldMatrix.multiply(camera.getTransformation());
        
        gl.uniformMatrix4fv(program.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(program.uniforms["uPosition"], false, this._worldMatrix.data);

        this._material.render(renderer);

        this._geometry.render(renderer, shader);
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
}

export default Instance;