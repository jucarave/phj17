import Renderer from '../engine/Renderer';
import Instance from '../entities/Instance';
import PropsFactory from '../factories/PropsFactory';
import {PropsNames} from '../factories/PropsFactory';
import { Vector3 } from '../math/Vector3';

interface Prop {
    name: string;
    position: Vector3;
    rotation?: Vector3;
    options?: any;
}

class Sector {
    private _renderer               : Renderer;
    private _position               : Vector3;
    private _size                   : Vector3;
    private _propList               : Array<Prop>;
    private _instances              : Array<Instance>;

    constructor(renderer: Renderer, position: Vector3, size: Vector3) {
        this._renderer = renderer;
        this._position = position;
        this._size = size;
        this._propList = [];
    }

    public addProp(propName: PropsNames, position: Vector3, rotation?: Vector3, options?: any): void {
        this._propList.push({
            name: propName,
            position: position,
            rotation: rotation,
            options: options
        });
    }

    public build(): Array<Instance> {
        if (this._instances != null) { return null; }

        let ret: Array<Instance> = [];

        for (let i=0,prop;prop=this._propList[i];i++) {
            ret.push(PropsFactory.createProp(this._renderer, prop.name, prop.position, prop.rotation, prop.options));
        }

        this._instances = ret;

        return ret;
    }

    public destroy(): void {
        if (this._instances == null) { return; }

        for (let i=0,ins;ins=this._instances[i];i++) {
            ins.destroy();
        }

        this._instances = null;
    }

    public get instances(): Array<Instance> {
        return this._instances;
    }
}

export default Sector;