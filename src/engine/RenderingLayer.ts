import Instance from './entities/Instance';
import Camera from './entities/Camera';
import List from './List';
import Renderer from './Renderer';

interface Params {
    [index: string] : any
}

export interface InstancesMap {
    instance: Instance;
    params: Params
}

class RenderingLayer {
    private _instances                   : List<InstancesMap>;

    public onPrerender                   : Function;
    public onPostUpdate                  : Function;

    constructor() {
        this._instances = new List();

        this.onPrerender = null;
        this.onPostUpdate = null;
    }

    private _createInstanceMap(instance: Instance): InstancesMap {
        return {
            instance: instance,
            params: {}
        }
    }

    public addInstance(instance: Instance): void {
        for (let i=0,ins;ins=this._instances.getAt(i);i++) {
            let cond1 = (!ins.instance.material && !instance.material),
                cond2 = (!cond1 && ins.instance.material.shader.equals(instance.material.shader));

            if (cond1 || cond2) {
                this._instances.insertAt(i+1, this._createInstanceMap(instance));
                return;
            }
        }

        this._instances.push(this._createInstanceMap(instance));
    }
    
    public awake(): void {
        this._instances.each((instance: InstancesMap) => {
            instance.instance.awake();
        });
    }

    public update(): void {
        this._instances.each((instance: InstancesMap) => {
            let ins = instance.instance;
            if (ins.isDestroyed) {
                this._instances.remove(instance);
                return;
            }

            ins.update();

            if (this.onPostUpdate) {
                this.onPostUpdate(instance);
            }
        });
    }

    public render(renderer: Renderer, camera: Camera): void {
        if (this.onPrerender) { 
            this.onPrerender(this._instances);
        }

        this._instances.each((instance: InstancesMap) => {
            instance.instance.render(renderer, camera);
        });
    }
}

export default RenderingLayer;