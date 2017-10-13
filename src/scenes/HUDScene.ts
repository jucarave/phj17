import Scene from '../engine/Scene';
import Renderer from '../engine/Renderer';
import BasicMaterial from '../engine/materials/BasicMaterial';
import SpriteGeometry from '../engine/geometries/SpriteGeometry';
import TextureManager from '../TexturesManager';
import Instance from '../entities/Instance';
import App from '../App';

class HUDScene extends Scene {
    constructor(app: App, renderer: Renderer) {
        super(app, renderer);

        this._camera = app.cameraOrtho;

        this._buildScene();
    }

    private _buildScene(): void {
        let geometry = new SpriteGeometry(this._renderer, 32.0, 32.0),
            texture = TextureManager.getTexture("MOCKGUN"),
            material = new BasicMaterial(texture, this._renderer),
            object = new Instance(this._renderer, geometry, material);

        object.translate(100, 100, 0);

        this.addGameObject(object);
    }

    public render(): void {
        super.render();
    }
}

export default HUDScene;