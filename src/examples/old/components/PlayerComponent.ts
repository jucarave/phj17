import { Component, Input, Camera, degToRad, get2DVectorDir, PI_2 } from '../../../engine';

import CharaComponent from 'components/CharaComponent';

const LIMIT_ROTATION = degToRad(70);

const CONTROLS = {
    UP: 0,
    LEFT: 1,
    RIGHT: 2,
    DOWN: 3
};

class PlayerComponent extends Component {
    private _keys               : Array<number>;
    private _callbackIds        : Array<string>
    private _camera             : Camera;
    private _height             : number;
    private _charaComponent     : CharaComponent;

    public static readonly componentName = "PlayerComponent";

    constructor() {
        super(PlayerComponent.componentName);

        this._keys = [];
        this._callbackIds = [];
        this._camera = null;
        this._height = 1.3;
    }

    private _getKeyId(keyCode: number): number {
        switch (keyCode) {
            case 65: return CONTROLS.LEFT;
            case 83: return CONTROLS.DOWN;
            case 68: return CONTROLS.RIGHT;
            case 87: return CONTROLS.UP;
            default: return null;
        }
    }

    private _handleKeyboard(keyCode: number, position: number): void {
        let keyId = this._getKeyId(keyCode);

        if (keyId === null){ return; }
        if (position == 1 && this._keys[keyId] == 2) { return; }

        this._keys[keyId] = position;
    }

    private _handleMouseMove(dx: number, dy: number): void {
        let rot = this._instance.rotation,
            ang_y = rot.y - degToRad(dx),
            ang_x = rot.x - degToRad(dy);

        if (ang_x > LIMIT_ROTATION) { ang_x = LIMIT_ROTATION; }else 
        if (ang_x < -LIMIT_ROTATION) { ang_x = -LIMIT_ROTATION; }

        this._instance.rotate(ang_x, ang_y, 0);
    }

    private _updateMovement(): void {
        let x = 0,
            y = 0;
        
        if (this._keys[CONTROLS.UP]) { y = -1; }else
        if (this._keys[CONTROLS.DOWN]) { y = 1; }
        if (this._keys[CONTROLS.RIGHT]) { x = 1; }else
        if (this._keys[CONTROLS.LEFT]) { x = -1; }

        if (x != 0 || y != 0) {
            let rot = this._instance.rotation,
                spd = 0.05,
                angVar = get2DVectorDir(x, y) - PI_2,
            
                xTo = Math.cos(rot.y + angVar) * spd,
                zTo = -Math.sin(rot.y + angVar) * spd;

            this._charaComponent.moveTo(xTo, zTo);
        }
    }
    
    private _updateCamera(): void {
        if (!this._camera) { return; }

        let pos = this._instance.position,
            rot = this._instance.rotation;

        this._camera.setPosition(pos.x, pos.y + this._height, pos.z);

        let c = Math.cos(rot.x),
            xTo = pos.x + Math.cos(rot.y) * c,
            yTo = pos.y + this._height + Math.sin(rot.x),
            zTo = pos.z - Math.sin(rot.y) * c;

        this._camera.setTarget(xTo, yTo, zTo);
    }

    public setCamera(camera: Camera): void {
        this._camera = camera;
    }

    public awake(): void {
        this._callbackIds.push(Input.onKeydown((keyCode: number) => { this._handleKeyboard(keyCode, 1); }));
        this._callbackIds.push(Input.onKeyup((keyCode: number) => { this._handleKeyboard(keyCode, 0); }));
        this._callbackIds.push(Input.onMouseMove((dx: number, dy: number) => { this._handleMouseMove(dx, dy); }));

        this._charaComponent = this._instance.getComponent<CharaComponent>(CharaComponent.componentName);
        if (!this._charaComponent) {
            throw new Error("PlayerComponent requires CharaComponent");
        }
    }

    public destroy(): void {
        for (let i=0,id;id=this._callbackIds[i];i++) {
            Input.deleteCallback(id);
        }
    }

    public update(): void {
        this._updateMovement();
        this._updateCamera();
    }

    public get moved(): boolean {
        return this._charaComponent.moved;
    }
}

export default PlayerComponent;