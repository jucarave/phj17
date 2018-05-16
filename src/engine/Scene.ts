import Camera from './Camera';
import Renderer from './Renderer';
import RenderingLayer from './RenderingLayer';
import { InstancesMap } from './RenderingLayer';
import List from './List';
import { getSquaredDistance } from './Utils';
import Instance from './entities/Instance';
import Vector3 from './math/Vector3';

class Scene {
    private _currentCamera              : Camera;

    protected _started                  : boolean;
    protected _renderingLayers          : List<RenderingLayer>;

    constructor() {
        this._started = false;

        this._initLayers();
    }

    private _initLayers(): void {
        this._renderingLayers = new List();

        let opaques = new RenderingLayer();
        this._renderingLayers.push(opaques);

        let transparents = new RenderingLayer();
        this._renderingLayers.push(transparents);

        transparents.onPostUpdate = ((item: InstancesMap) => {
            item.params.distance = getSquaredDistance(item.instance.position, this._currentCamera.position);
        });

        transparents.onPrerender = (instances: List<InstancesMap>) => {
            instances.sort((itemA: InstancesMap, itemB: InstancesMap) => {
                return (itemA.params.distance > itemB.params.distance);
            });
        };
    }

    public addGameObject(instance: Instance): void {
        let mat = instance.material;

        instance.setScene(this);
        
        if (this._started) {
            instance.awake();
        }

        let layer = this._renderingLayers.getAt(0);
        if (mat && !mat.isOpaque) {
            layer = this._renderingLayers.getAt(1);
        }
        
        layer.addInstance(instance);
    }

    public testCollision(instance: Instance, direction: Vector3): Vector3 {
        instance;
        return direction;
    }

    public init(): void {
        this._renderingLayers.each((layer: RenderingLayer) => {
            layer.awake();
        });

        this._started = true;
    }

    public update(): void {
        this._renderingLayers.each((layer: RenderingLayer) => {
            layer.update();
        });
    }

    public render(renderer: Renderer, camera: Camera): void {
        this._currentCamera = camera;

        this._renderingLayers.each((layer: RenderingLayer) => {
            layer.render(renderer, camera);
        });

        this._currentCamera = null;
    }
}

export default Scene;