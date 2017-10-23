import Scene from 'engine/Scene';
import Instance from 'engine/entities/Instance';
import { Vector3 } from 'engine/math/Vector3';
import Renderer from 'engine/Renderer';

abstract class Collision {
    protected _scene                : Scene;
    protected _instance             : Instance;
    protected _position             : Vector3;
    protected _offset               : Vector3;
    protected _displayInstance      : Instance;

    public solid                    : boolean;

    constructor(scene: Scene) {
        this.setScene(scene);
        this.solid = true;

        this._offset = new Vector3(0, 0, 0);
    }

    public abstract test(position: Vector3, direction: Vector3) : Vector3;

    public setScene(scene: Scene): void {
        this._scene = scene;
    }

    public setInstance(instance: Instance): void {
        this._instance = instance;
    }

    public addCollisionInstance(renderer: Renderer): void {
        renderer;
    }

    public get instance(): Instance {
        return this._instance;
    }

    public get displayInstance(): Instance {
        return this._displayInstance;
    }
}

export default Collision;