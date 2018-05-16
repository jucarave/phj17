import Renderer from '../Renderer';
import Camera from '../Camera';
import Scene from '../Scene';
import Collision from '../collisions/Collision';
import Geometry from '../geometries/Geometry';
import Material from '../materials/Material';
import Shader from '../shaders/Shader';
import Component from '../Component';
import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import { get2DAngle } from '../Utils';
import Config from '../Config';
import List from '../List';

class Instance {
    protected _geometry           : Geometry;
    protected _material           : Material;
    protected _rotation           : Vector3;
    protected _transform          : Matrix4;
    protected _scene              : Scene;
    protected _components         : List<Component>;
    protected _collision          : Collision;
    protected _needsUpdate        : boolean;
    protected _destroyed          : boolean;
    
    public position            : Vector3;
    public isBillboard         : boolean;
    
    constructor(geometry: Geometry = null, material: Material = null) {
        this._transform = Matrix4.createIdentity();
        this.position = new Vector3(0.0);
        this._rotation = new Vector3(0.0);
        this.isBillboard = false;
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._scene = null;
        this._components = new List();
        this._collision = null;
        this._destroyed = false;
    }
    
    public translate(x: number|Vector3, y: number = 0, z: number = 0, relative: boolean = false): Instance {
        let _x: number;

        if ((<Vector3>x).length) {
            _x = (<Vector3>x).x;
            y = (<Vector3>x).y;
            z = (<Vector3>x).z;
        } else {
            _x = <number>x;
        }

        if (relative) {
            this.position.add(_x, y, z);
        } else {
            this.position.set(_x, y, z);
        }

        this._needsUpdate = true;

        if (this._collision && this._collision.displayInstance) {
            this._collision.displayInstance.translate(x, y, z, true);
        }

        return this;
    }
    
    public rotate(x: number|Vector3, y: number = 0, z: number = 0, relative: boolean = false): Instance {
        let _x: number;
        
        if ((<Vector3>x).length) {
            _x = (<Vector3>x).x;
            y = (<Vector3>x).y;
            z = (<Vector3>x).z;
        } else {
            _x = <number>x;
        }
        
        if (relative) {
            this._rotation.add(_x, y, z);
        } else {
            this._rotation.set(_x, y, z);
        }

        this._needsUpdate = true;

        return this;
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

        this._transform.multiply(Matrix4.createXRotation(this._rotation.x));
        this._transform.multiply(Matrix4.createZRotation(this._rotation.z));
        this._transform.multiply(Matrix4.createYRotation(this._rotation.y));

        let offset = this._geometry.offset;
        this._transform.translate(this.position.x + offset.x, this.position.y + offset.y, this.position.z + offset.z);

        this._needsUpdate = false;

        return this._transform;
    }

    public setCollision(collision: Collision): void {
        this._collision = collision;
        collision.setInstance(this);
    }

    public clear(): void {
        this.position.set(0, 0, 0);
        this._rotation.set(0, 0, 0);
        this._transform.setIdentity();
        this._geometry = null;
        this._material = null;
        this.isBillboard = false;
        this._needsUpdate = true;
        this._scene = null;
        this._components.clear();
        this._collision = null;
        this._destroyed = true;
    }

    public awake(): void {
        this._components.each((component: Component) => {
            component.awake();
        });

        if (this._collision && Config.DISPLAY_COLLISIONS) {
            let collision = this._collision;

            collision.setScene(this._scene);
            // collision.addCollisionInstance(this._renderer);
        }
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

        if (this._geometry.isDynamic) {
            this._geometry.destroy();
        }

        if (this._collision && Config.DISPLAY_COLLISIONS) {
            this._collision.destroy();
        }

        this._destroyed = true;
    }

    public render(renderer: Renderer, camera: Camera): void {
        if (!this._geometry || !this._material) { return; }
        if (!this._material.isReady) { return; }

        renderer.switchShader(this._material.shaderName);

        const gl = renderer.GL,
            shader = Shader.lastProgram;

        if (this.isBillboard) {
            this.rotate(0, get2DAngle(this.position, camera.position) + Math.PI / 2, 0);
        }

        const uPosition = Matrix4.createIdentity();
        uPosition.multiply(this.getTransformation());
        uPosition.multiply(camera.getTransformation());
        
        gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(shader.uniforms["uPosition"], false, uPosition.data);

        this._material.render(renderer);

        this._geometry.render(renderer);
    }

    public get geometry(): Geometry {
        return this._geometry;
    }
    
    public get material(): Material {
        return this._material;
    }
    
    public get rotation(): Vector3 {
        return this._rotation;
    }

    public get collision(): Collision {
        return this._collision;
    }

    public get scene(): Scene {
        return this._scene;
    }

    public get isDestroyed(): boolean {
        return this._destroyed;
    }
}

export default Instance;