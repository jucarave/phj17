import Renderer from 'engine/Renderer';
import Scene from 'engine/Scene';
import { DISPLAY_COLLISIONS } from 'engine/Constants';
import { Vector3 } from 'engine/math/Vector3';
import Instance from 'engine/entities/Instance';
import Collision from 'engine/collisions/Collision';
import BoxCollision from 'engine/collisions/BoxCollision';
import PropsFactory from 'factories/PropsFactory';
import {PropsNames} from 'factories/PropsFactory';
import EntityFactory from 'factories/EntityFactory';
import { EntitiesNames } from 'factories/EntityFactory';

interface Prop {
    name: string;
    options?: any;
}

class Sector {
    private _renderer               : Renderer;
    private _scene                  : Scene;
    private _position               : Vector3;
    private _size                   : Vector3;
    private _propList               : Array<Prop>;
    private _insList                : Array<Prop>;
    private _instances              : Array<Instance>;
    private _solidInstances         : Array<Collision>;
    private _collision              : BoxCollision;

    constructor(renderer: Renderer, position: Vector3, size: Vector3) {
        this._renderer = renderer;
        this._position = position;
        this._size = size;
        this._propList = [];
        this._insList = [];
        this._solidInstances = [];
        this._scene = null;
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

    public setScene(scene: Scene): void {
        this._scene = scene;
    }

    public registerCollision(collision: Collision): void {
        this._solidInstances.push(collision);
    }

    public displayCollisions(): void {
        if (DISPLAY_COLLISIONS) {
            for (let i=0,collision;collision=this._solidInstances[i];i++) {
                collision.setScene(this._scene);
                collision.addCollisionInstance(this._renderer);
            }
        }
    }

    public build(): Array<Instance> {
        if (this._instances != null) { return null; }

        let ret: Array<Instance> = [],
            solid: Array<Collision> = [];

        for (let i=0,prop;prop=this._propList[i];i++) {
            let instance = PropsFactory.createProp(this._renderer, prop.name, prop.options);
            
            ret.push(instance);

            if (instance.collision && instance.collision.solid) {
                solid.push(instance.collision);
            }
        }

        for (let i=0,ins;ins=this._insList[i];i++) {
            let instance = EntityFactory.createInstance(this._renderer, <EntitiesNames>ins.name, ins.options.position);
            
            ret.push(instance);
            
            if (instance.collision && instance.collision.solid) {
                solid.push(instance.collision);
            }
        }

        this._instances = ret;
        this._solidInstances = this._solidInstances.concat(solid);

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

    public get solidInstances(): Array<Collision> {
        return this._solidInstances;
    }
}

export default Sector;