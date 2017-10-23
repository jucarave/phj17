import Renderer from 'engine/Renderer';
import { Vector3 } from 'engine/math/Vector3';
import Instance from 'engine/entities/Instance';
import PropsFactory from 'factories/PropsFactory';
import {PropsNames} from 'factories/PropsFactory';
import EntityFactory from 'factories/EntityFactory';
import { EntitiesNames } from 'factories/EntityFactory';
import BoxCollision from 'engine/collisions/BoxCollision';

interface Prop {
    name: string;
    options?: any;
}

class Sector {
    private _renderer               : Renderer;
    private _position               : Vector3;
    private _size                   : Vector3;
    private _propList               : Array<Prop>;
    private _insList                : Array<Prop>;
    private _instances              : Array<Instance>;
    private _collision              : BoxCollision;

    constructor(renderer: Renderer, position: Vector3, size: Vector3) {
        this._renderer = renderer;
        this._position = position;
        this._size = size;
        this._propList = [];
        this._insList = [];
    }

    public addProp(propName: PropsNames, options?: any): void {
        this._propList.push({
            name: propName,
            options: options
        });
    }

    public addInstance(insName: EntitiesNames, options?: any): void {
        this._insList.push({
            name: insName,
            options: options
        });
    }

    public setCollision(position: Vector3, size: Vector3): void {
        this._collision = new BoxCollision(position, size).centerInAxis(false, false, false);
        this._collision.solid = false;
    }

    public build(): Array<Instance> {
        if (this._instances != null) { return null; }

        let ret: Array<Instance> = [];

        for (let i=0,prop;prop=this._propList[i];i++) {
            ret.push(PropsFactory.createProp(this._renderer, prop.name, prop.options));
        }

        for (let i=0,ins;ins=this._insList[i];i++) {
            ret.push(EntityFactory.createInstance(this._renderer, <EntitiesNames>ins.name, ins.options.position));
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

    public get collision(): BoxCollision {
        return this._collision;
    }
}

export default Sector;