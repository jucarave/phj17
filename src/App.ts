import Renderer from './engine/Renderer';
import Input from './engine/Input';
import Camera from './engine/Camera';
import Texture from './engine/Texture';
import CubeGeometry from './engine/geometries/CubeGeometry';
import BasicMaterial from './engine/materials/BasicMaterial';
import Scene from './engine/Scene';
import Instance from './entities/Instance';
import EntityFactory from './factories/EntityFactory';
import { CAMERA_FOV, CAMERA_RATIO, CAMERA_ZFAR, CAMERA_ZNEAR, CANVAS_WIDTH, CANVAS_HEIGHT } from './Constants';

class App {
    private _renderer           : Renderer;

    private scene: Scene;

    constructor() {
        this._renderer = new Renderer(CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById("divGame"));

        Input.init(this._renderer.canvas);

        let camera = Camera.createPerspective(CAMERA_FOV, CAMERA_RATIO, CAMERA_ZNEAR, CAMERA_ZFAR);
        camera.setPosition(0, 0, 2);
        camera.setTarget(0, 0, 0);

        let geometry = new CubeGeometry(this._renderer, 1.0, 1.0, 1.0);

        let texture = new Texture("img/texture.png", this._renderer, () => { this.loop(); });

        let material = new BasicMaterial(texture, this._renderer);

        let object = new Instance(this._renderer, geometry, material);
        
        let player = EntityFactory.createPlayer(this._renderer, camera);

        this.scene = new Scene();
        this.scene.addGameObject(object);
        this.scene.addGameObject(player);
        this.scene.setCamera(camera);
        this.scene.init();
    }

    public loop(): void {
        this._renderer.clear();
        this.scene.render();

        requestAnimationFrame(() => { this.loop(); });
    }
}

window.onload = () => {
    return new App();
};