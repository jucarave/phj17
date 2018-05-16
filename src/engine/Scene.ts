import Camera from './Camera';
import Renderer from './Renderer';
import RenderingLayer from './RenderingLayer';
import { InstancesMap } from './RenderingLayer';
import List from './List';
import { getSquaredDistance } from './Utils';
import Instance from './entities/Instance';
import Vector3 from './math/Vector3';

class Scene {
    protected _renderer                 : Renderer;
    protected _camera                   : Camera;
    protected _started                  : boolean;
    protected _renderingLayers          : List<RenderingLayer>;

    constructor(renderer: Renderer) {
        this._renderer = renderer;
        this._camera = null;
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
            item.params.distance = getSquaredDistance(item.instance.position, this._camera.position);
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

    public setCamera(camera: Camera): void {
        this._camera = camera;
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

    public render(): void {
        this._renderingLayers.each((layer: RenderingLayer) => {
            layer.render(this._camera);
        });
    }
}

export default Scene;