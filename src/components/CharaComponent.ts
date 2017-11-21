import Component from 'engine/Component';
import { vec3 } from 'engine/math/Vector3';

class CharaComponent extends Component {
    private _moved          : boolean;

    public static readonly componentName = "CharaComponent";

    constructor() {
        super(CharaComponent.componentName);
    }

    public moveTo(xTo: number, zTo: number): void {
        let dir = vec3(xTo, 0, zTo);

        this._instance.translate(dir.x, 0, dir.z, true);
        this._moved = true;

        dir.delete();
    }

    public awake(): void {
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