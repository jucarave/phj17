import Scene from 'engine/Scene';
import Renderer from 'engine/Renderer';
import ColorMaterial from 'engine/materials/ColorMaterial';
import Instance from 'engine/entities/Instance';
import { vec3 } from 'engine/math/Vector3';
import { Vector4 } from 'engine/math/Vector4';
import { rememberPoolAlloc as rpa, freePoolAlloc } from 'engine/Utils';
import EntityFactory from 'factories/EntityFactory';
import PropsFactory from 'factories/PropsFactory';
import App from 'App';
import HUDScene from 'scenes/HUDScene';

class CollisionScene extends Scene {
    private _hud                : HUDScene;
    private _player             : Instance;

    constructor(app: App, renderer: Renderer) {
        super(app, renderer);

        this._buildScene();
    }

    private _buildScene(): void {
        let camera = this._app.camera,
            player = EntityFactory.createPlayer(this._renderer, camera);

        // Sectors
        let mat = new ColorMaterial(this._renderer, new Vector4(1.0, 0.0, 0.0, 1.0));
        this.addGameObject(PropsFactory.create3DModel(this._renderer, {material: mat, model: 'CollisionTest', solid: true }));

        this.addGameObject(player.translate(rpa(vec3(10.0, 0.0, 4.0))).rotate(0, Math.PI, 0));
        this.setCamera(camera);

        this._hud = new HUDScene(this._app, this._renderer);

        this._player = player;

        freePoolAlloc();
    }

    public render(): void {
        super.render();

        this._hud.render();
    }

    public get player(): Instance {
        return this._player;
    }
}

export default CollisionScene;