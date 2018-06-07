import { Renderer, Scene, Texture, BasicMaterial, WallGeometry, Vector3, Instance, coordsToOrtho } from '../../../engine';

import App from 'App';
import TextureManager from 'managers/TexturesManager';

class HUDScene extends Scene {
    constructor(app: App, renderer: Renderer) {
        super(renderer);

        this._camera = app.cameraOrtho;

        this._buildScene();
    }

    private _createSprite(texture: Texture, width: number, height: number, position: Vector3): void {
        let geometry = new WallGeometry(this._renderer, width, height),
            material = new BasicMaterial(this._renderer, texture),
            object = Instance.allocate(this._renderer, geometry, material);
        
        object.translate(position.x, position.y, position.z);

        this.addGameObject(object);
    }

    private _buildScene(): void {
        let coords = coordsToOrtho(this._camera, 106, 104);
        this._createSprite(TextureManager.getTexture("MOCKGUN"), 32.0, 32.0, coords);

        coords.delete();
    }

    public render(): void {
        super.render();
    }
}

export default HUDScene;