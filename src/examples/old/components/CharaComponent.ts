import { Component, vec3 } from '../../../engine';

class CharaComponent extends Component {
    private _moved          : boolean;

    public static readonly componentName = "CharaComponent";

    constructor() {
        super(CharaComponent.componentName);
    }

    public moveTo(xTo: number, zTo: number): void {
        let dir = vec3(xTo, 0, zTo),
            collision = this._instance.scene.testCollision(this._instance, dir);

        if (collision.x != 0 || collision.z != 0) {
            this._instance.translate(collision.x, 0, collision.z, true);
            this._moved = true;
        }

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