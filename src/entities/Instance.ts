import Renderer from '../engine/Renderer';
import Camera from '../engine/Camera';
import Scene from '../engine/Scene';
import Geometry from '../engine/geometries/Geometry';
import Material from '../engine/materials/Material';
import Shader from '../engine/shaders/Shader';
import Component from '../components/Component';
import Matrix4 from '../math/Matrix4';
import { Vector3, vec3 } from '../math/Vector3';

class Instance {
    private _renderer           : Renderer;
    private _geometry           : Geometry;
    private _material           : Material;
    private _position           : Vector3;
    private _rotation           : Vector3;
    private _transform          : Matrix4;
    private _uPosition          : Matrix4;
    private _scene              : Scene;
    private _components         : Array<Component>;
    private _needsUpdate        : boolean;
    
    constructor(renderer: Renderer, geometry: Geometry = null, material: Material = null) {
        this._transform = Matrix4.createIdentity();
        this._uPosition = Matrix4.createIdentity();
        this._position = vec3(0.0);
        this._rotation = vec3(0.0);
        this._needsUpdate = true;
        this._geometry = geometry;
        this._material = material;
        this._renderer = renderer;
        this._scene = null;
        this._components = [];
    }
    
    public translate(x: number, y: number, z: number, relative: boolean = false): Instance {
        if (relative) {
            this._position.add(x, y, z);
        } else {
            this._position.set(x, y, z);
        }

        this._needsUpdate = true;

        return this;
    }
    
    public rotate(x: number, y: number, z: number, relative: boolean = false): Instance {
        if (relative) {
            this._rotation.add(x, y, z);
        } else {
            this._rotation.set(x, y, z);
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
    
    public getTransformation(): Matrix4 {
        if (!this._needsUpdate) {
            return this._transform;
        }

        Matrix4.setIdentity(this._transform);

        Matrix4.multiply(this._transform, Matrix4.createXRotation(this._rotation.x));
        Matrix4.multiply(this._transform, Matrix4.createZRotation(this._rotation.z));
        Matrix4.multiply(this._transform, Matrix4.createYRotation(this._rotation.y));

        Matrix4.translate(this._transform, this._position.x, this._position.y, this._position.z);

        this._needsUpdate = false;

        return this._transform;
    }

    public awake(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.awake();
        }
    }

    public update(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.update();
        }
    }

    public destroy(): void {
        for (let i=0,component;component=this._components[i];i++) {
            component.destroy();
        }
    }

    public render(camera: Camera): void {
        if (!this._geometry || !this._material) { return; }
        if (!this._material.isReady) { return; }

        this._renderer.switchShader(this._material.shaderName);

        let gl = this._renderer.GL,
            shader = Shader.lastProgram;

        this._uPosition = Matrix4.setIdentity(this._uPosition);
        this._uPosition = Matrix4.multiply(this._uPosition, this.getTransformation());
        this._uPosition = Matrix4.multiply(this._uPosition, camera.getTransformation());
        
        gl.uniformMatrix4fv(shader.uniforms["uProjection"], false, camera.projection);
        gl.uniformMatrix4fv(shader.uniforms["uPosition"], false, this._uPosition);

        this._material.render();

        this._geometry.render();
    }
    
    public get material(): Material {
        return this._material;
    }

    public get position(): Vector3 {
        return this._position;
    }
    
    public get rotation(): Vector3 {
        return this._rotation;
    }
}

export default Instance;