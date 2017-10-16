import Scene from '../Scene';
import { Vector3 } from '../../math/Vector3';

abstract class Collision {
    protected _scene                : Scene;

    constructor(scene: Scene) {
        this.setScene(scene);
    }

    public abstract test(position: Vector3, direction: Vector3) : Vector3;

    public setScene(scene: Scene) {
        this._scene = scene;
    }
}

export default Collision;