import Camera from './entities/Camera';
import Renderer from './Renderer';
import RenderingLayer from './RenderingLayer';
import { InstancesMap } from './RenderingLayer';
import List from './List';
import { getSquaredDistance } from './Utils';
import Instance from './entities/Instance';

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

        const opaques = new RenderingLayer();
        this._renderingLayers.push(opaques);

        const transparents = new RenderingLayer();
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

    public addGameObject(instance: Instance, layerId: number = 0): void {
        instance.setScene(this);
        
        let layer = this._renderingLayers.getAt(layerId);
        if (instance.material && !instance.material.isOpaque) {
            layer = this._renderingLayers.getAt(1);
        }
        
        layer.addInstance(instance);

        if (this._started) {
            instance.awake();
        }
    }

    public init(): void {
        this._renderingLayers.each((layer: RenderingLayer) => layer.awake());

        this._started = true;
    }

    public update(): void {
        this._renderingLayers.each((layer: RenderingLayer) => layer.update());
    }

    public render(renderer: Renderer, camera: Camera): void {
        this._currentCamera = camera;

        this._renderingLayers.each((layer: RenderingLayer) => layer.render(renderer, camera));

        this._currentCamera = null;
    }
}

export default Scene;