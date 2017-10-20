import Scene from 'engine/Scene';
import Instance from 'engine/entities/Instance';
import { Vector3 } from 'engine/math/Vector3';

abstract class Collision {
    protected _scene                : Scene;
    protected _instance             : Instance;

    constructor(scene: Scene) {
        this.setScene(scene);
    }

    public abstract test(position: Vector3, direction: Vector3) : Vector3;

    public setScene(scene: Scene): void {
        this._scene = scene;
    }

    public setInstance(instance: Instance): void {
        this._instance = instance;
    }

    public get instance(): Instance {
        return this._instance;
    }
}

export default Collision;