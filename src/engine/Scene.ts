import Instance from '../entities/Instance';
import Camera from './Camera';
import Renderer from './Renderer';

interface InstancesMap {
    [index: string] : Array<Instance>;
}

interface MaterialsMap {
    [index: string] : InstancesMap;
}

class Scene {
    protected _renderer           : Renderer;
    protected _instances          : MaterialsMap;
    protected _camera             : Camera;

    constructor() {
        this._instances = {};
        this._camera = null;
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

        instance.setScene(this);
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
    }

    public render(): void {
        let opaques: Array<Instance> = [];

        for (let i in this._instances) {
            for (let j in this._instances[i]) {
                var instances = this._instances[i][j];

                for (let k=0,ins;ins=instances[k];k++) {
                    ins.update();
                    opaques.push(ins);
                }
            }
        }

        for (let i=0,ins;ins=opaques[i];i++) {
            ins.render(this._camera);
        }
    }
}

export default Scene;