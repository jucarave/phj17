import Scene from '../engine/Scene';
import Renderer from '../engine/Renderer';
import CubeGeometry from '../engine/geometries/CubeGeometry';
import BasicMaterial from '../engine/materials/BasicMaterial';
import Instance from '../entities/Instance';
import EntityFactory from '../factories/EntityFactory';
import TexturesManager from '../TexturesManager';
import { Vector3, vec3 } from '../math/Vector3';
import App from '../App';
import HUDScene from './HUDScene';

class DemoScene extends Scene {
    private _hud: HUDScene;

    constructor(app: App, renderer: Renderer) {
        super(app, renderer);

        this._buildScene();
    }

    private addCube(position: Vector3, size: Vector3): void {
        let geometry = new CubeGeometry(this._renderer, size.x, size.y, size.z),
        texture = TexturesManager.getTexture("TEXTURE_16"),
        material = new BasicMaterial(texture, this._renderer),
        object = new Instance(this._renderer, geometry, material);

        object.translate(position.x, position.y, position.z);

        this.addGameObject(object);
    }

    private _buildScene(): void {
        let camera = this._app.camera,
            player = EntityFactory.createPlayer(this._renderer, camera);

        this.addCube(vec3(0.0, 0.5, 0.0), vec3(1.0));
        
        this.addGameObject(player);
        this.setCamera(camera);

        this._hud = new HUDScene(this._app, this._renderer);
    }

    public render(): void {
        super.render();

        this._hud.render();
    }
}

export default DemoScene;