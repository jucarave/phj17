import Collision from 'engine/collisions/Collision';
import Instance from 'engine/entities/Instance';
import Camera from 'engine/Camera';
import Renderer from 'engine/Renderer';
import { Vector3 } from 'engine/math/Vector3';
import { getSquaredDistance } from 'engine/Utils';
import App from 'App';

interface InstancesMap {
    [index: string] : Array<Instance>;
}

interface MaterialsMap {
    [index: string] : InstancesMap;
}

interface TransparentInstance {
    instance: Instance,
    distance: number
}

class Scene {
    protected _app                : App;
    protected _renderer           : Renderer;
    protected _instances          : MaterialsMap;
    protected _camera             : Camera;
    protected _collisions         : Array<Collision>;
    protected _started            : boolean;

    constructor(app: App, renderer: Renderer) {
        this._app = app;
        this._renderer = renderer;
        this._instances = {};
        this._collisions = [];
        this._camera = null;
        this._started = false;
    }

    public addGameObject(instance: Instance): void {
        let mat = instance.material,
            matuuid = 'noMaterial',
            shduuid = 'noShader';

        if (mat) {
            matuuid = mat.uuid;
            shduuid = mat.getShader().uuid;
        }

        if (!this._instances[shduuid]) {
            this._instances[shduuid] = {};
        }

        if (!this._instances[shduuid][matuuid]) {
            this._instances[shduuid][matuuid] = [];
        }

        this._instances[shduuid][matuuid].push(instance);

        if (instance.collision) {
            this.registerCollision(instance.collision);
        }

        instance.setScene(this);

        if (this._started) {
            instance.awake();
        }
    }

    public registerCollision(collision: Collision): void {
        collision.setScene(this);
        this._collisions.push(collision);
    }

    public testCollision(position: Vector3, direction: Vector3): Vector3 {
        for (let i=0,col;col=this._collisions[i];i++) {
            if (col.instance.isDestroyed){
                this._collisions.splice(i, 1);
                i--;
                continue;
            }

            direction = col.test(position, direction);
        }

        return direction;
    }

    public setCamera(camera: Camera): void {
        this._camera = camera;
    }

    public init(): void {
        for (let i in this._instances) {
            for (let j in this._instances[i]) {
                var instances = this._instances[i][j];

                for (let k=0,ins;ins=instances[k];k++) {
                    ins.awake();
                }
            }
        }

        this._started = true;
    }

    public update(): void {
        
    }

    public render(): void {
        let opaques: Array<Instance> = [],
            transparents: Array<TransparentInstance> = [];

        for (let i in this._instances) {
            for (let j in this._instances[i]) {
                var instances = this._instances[i][j];

                for (let k=0,ins;ins=instances[k];k++) {
                    if (ins.isDestroyed) {
                        this._instances[i][j].splice(k, 1);
                        k--;
                        continue;
                    }

                    ins.update();

                    if (ins.material) {
                        if (ins.material.isOpaque) {
                            opaques.push(ins);
                        } else {
                            let dis = getSquaredDistance(ins.position, this._camera.getPosition()),
                                add = false;

                            for (let m=0,trans;trans=transparents[m];m++) {
                                if (dis > trans.distance) {
                                    transparents.splice(m, 0, {instance: ins, distance: dis});
                                    add = true;
                                    m = transparents.length;
                                }
                            }

                            if (!add) {
                                transparents.push({instance: ins, distance: dis});
                            }
                        }
                    }
                }
            }
        }

        for (let i=0,ins;ins=opaques[i];i++) {
            ins.render(this._camera);
        }
        
        for (let i=0,ins;ins=transparents[i];i++) {
            ins.instance.render(this._camera);
        }
    }
}

export default Scene;