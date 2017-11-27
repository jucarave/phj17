import Component from 'engine/Component';
import Physics from 'engine/physics/Physics';
import Ellipsoid from 'engine/physics/Ellipsoid';
import { Vector3, vec3 } from 'engine/math/Vector3';

class CharaComponent extends Component {
    private _moved          : boolean;
    private _ellipsoid      : Ellipsoid;

    public static readonly componentName = "CharaComponent";

    constructor() {
        super(CharaComponent.componentName);
    }

    public moveTo(xTo: number, zTo: number): void {
        let dir = vec3(xTo, 0, zTo);

        Physics.checkCollision(this._ellipsoid, dir);

        this._instance.translate(dir.x, 0, dir.z, true);
        this._moved = true;

        dir.delete();
    }

    public awake(): void {
        this._instance.position.y = 1.3 / 2;
        this._ellipsoid = new Ellipsoid(this._instance.position, new Vector3(1.0, 1.3, 1.0));
    }

    public destroy(): void {
    }

    public update(): void {
        this._moved = false;
    }

    public get moved(): boolean {
        return this._moved;
    }
}

export default CharaComponent;