import Instance from 'engine/entities/Instance';
import Camera from 'engine/Camera';
import Renderer from 'engine/Renderer';
import { Vector3 } from 'engine/math/Vector3';
import { getSquaredDistance } from 'engine/Utils';
import List from 'engine/List';
import App from 'App';

interface InstancesMap {
    [index: string] : List<Instance>;
}

interface TransparentInstance {
    instance: Instance,
    distance: number
}

class Scene {
    protected _app                      : App;
    protected _renderer                 : Renderer;
    protected _opaqueInstances          : InstancesMap;
    protected _transparentInstances     : List<TransparentInstance>;
    protected _camera                   : Camera;
    protected _started                  : boolean;

    constructor(app: App, renderer: Renderer) {
        this._app = app;
        this._renderer = renderer;
        this._opaqueInstances = {};
        this._transparentInstances = new List();
        this._camera = null;
        this._started = false;
    }

    public addGameObject(instance: Instance): void {
        let mat = instance.material,
            shduuid = 'noShader';

        instance.setScene(this);
        
        if (this._started) {
            instance.awake();
        }

        if (mat) {
            shduuid = mat.getShader().uuid;

            if (!mat.isOpaque) {
                this._transparentInstances.push({
                    instance: instance,
                    distance: 0
                });

                return;
            }
        }

        if (!this._opaqueInstances[shduuid]) {
            this._opaqueInstances[shduuid] = new List();
        }

        this._opaqueInstances[shduuid].push(instance);
    }

    public testCollision(instance: Instance, direction: Vector3): Vector3 {
        instance;
        return direction;
    }

    public setCamera(camera: Camera): void {
        this._camera = camera;
    }

    public init(): void {
        for (let i in this._opaqueInstances) {
            this._opaqueInstances[i].each((ins: Instance) => {
                ins.awake();
            });
        }

        this._transparentInstances.each((ins: TransparentInstance) => {
            ins.instance.awake();
        });

        this._started = true;
    }

    public update(): void {
        for (let i in this._opaqueInstances) {
            this._opaqueInstances[i].each((ins: Instance) => {
                if (ins.isDestroyed) {
                    let shdId = (ins.material)? ins.material.getShader().uuid : 'noShader';
                    this._opaqueInstances[shdId].remove(ins);
                    return;
                }
    
                ins.update();
            });
        }

        this._transparentInstances.each((tIns: TransparentInstance) => {
            let ins = tIns.instance;
            
            if (ins.isDestroyed) {
                this._transparentInstances.remove(tIns);
                return;
            }

            ins.update();

            tIns.distance = getSquaredDistance(ins.position, this._camera.position);
        });
    }

    public render(): void {
        for (let i in this._opaqueInstances) {
            this._opaqueInstances[i].each((ins: Instance) => {
                ins.render(this._camera);
            });
        }

        this._transparentInstances.sort((itemA: TransparentInstance, itemB: TransparentInstance) => {
            return (itemA.distance > itemB.distance);
        });

        this._transparentInstances.each((ins: TransparentInstance) => {
            ins.instance.render(this._camera);
        });
    }
}

export default Scene;