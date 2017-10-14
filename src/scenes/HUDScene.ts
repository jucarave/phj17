import Scene from '../engine/Scene';
import Renderer from '../engine/Renderer';
import BasicMaterial from '../engine/materials/BasicMaterial';
import SpriteGeometry from '../engine/geometries/SpriteGeometry';
import Texture from '../engine/Texture';
import TextureManager from '../TexturesManager';
import Instance from '../entities/Instance';
import { Vector3 } from '../math/Vector3';
import App from '../App';
import { coordsToOrtho } from '../Utils';

class HUDScene extends Scene {
    constructor(app: App, renderer: Renderer) {
        super(app, renderer);

        this._camera = app.cameraOrtho;

        this._buildScene();
    }

    private _createSprite(texture: Texture, width: number, height: number, position: Vector3): void {
        let geometry = new SpriteGeometry(this._renderer, width, height),
            material = new BasicMaterial(texture, this._renderer),
            object = new Instance(this._renderer, geometry, material);
        
        object.translate(position.x, position.y, position.z);

        this.addGameObject(object);
    }

    private _buildScene(): void {
        this._createSprite(TextureManager.getTexture("MOCKGUN"), 32.0, 32.0, coordsToOrtho(106, 104));
    }

    public render(): void {
        super.render();
    }
}

export default HUDScene;