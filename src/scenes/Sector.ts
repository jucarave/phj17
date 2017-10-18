import Renderer from '../engine/Renderer';
import { Vector3 } from '../engine/math/Vector3';
import Instance from '../engine/entities/Instance';
import PropsFactory from '../factories/PropsFactory';
import {PropsNames} from '../factories/PropsFactory';

interface Prop {
    name: string;
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

    public addProp(propName: PropsNames, options?: any): void {
        this._propList.push({
            name: propName,
            options: options
        });
    }

    public build(): Array<Instance> {
        if (this._instances != null) { return null; }

        let ret: Array<Instance> = [];

        for (let i=0,prop;prop=this._propList[i];i++) {
            ret.push(PropsFactory.createProp(this._renderer, prop.name, prop.options));
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