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

        let newDir = Physics.checkCollision(this._ellipsoid, dir);

        this._instance.translate(newDir.x, newDir.y, newDir.z, true);
        this._moved = true;

        dir.delete();
    }

    public setEllipsoid(size: Vector3, offset: Vector3): void {
        this._ellipsoid = new Ellipsoid(null, size, offset);
    }

    public awake(): void {
        if (this._ellipsoid && this._instance) {
            this._ellipsoid.position = this._instance.position;
        }
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