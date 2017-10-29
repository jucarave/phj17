import Component from 'engine/Component';
import { vec3 } from 'engine/math/Vector3';

class CharaComponent extends Component {
    private _moved          : boolean;

    public static readonly componentName = "CharaComponent";

    constructor() {
        super(CharaComponent.componentName);
    }

    public moveTo(xTo: number, zTo: number): void {
        let collision = this._instance.scene.testCollision(this._instance, vec3(xTo, 0, zTo));

        if (collision.x != 0 || collision.z != 0) {
            this._instance.translate(collision.x, 0, collision.z, true);
            this._moved = true;
        }
    }

    public awake(): void {
    }

    public destroy(): void {
    }

    public update(): void {
    }

    public get moved(): boolean {
        return this._moved;
    }
}

export default CharaComponent;