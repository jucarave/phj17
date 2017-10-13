import Renderer from './engine/Renderer';
import Input from './engine/Input';
import Scene from './engine/Scene';
import Camera from './engine/Camera';
import TexturesManager from './TexturesManager';
import DemoScene from './scenes/DemoScene';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CAMERA_FOV, CAMERA_RATIO, CAMERA_ZFAR, CAMERA_ZNEAR, CAMERA_ORTHO_HEIGHT, CAMERA_ORTHO_WIDTH } from './Constants';

class App {
    private _renderer                   : Renderer;
    private _scene                      : Scene;
    
    public readonly camera              : Camera;
    public readonly cameraOrtho         : Camera;

    constructor() {
        this._renderer = new Renderer(CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById("divGame"));

        Input.init(this._renderer.canvas);
        TexturesManager.init(this._renderer);

        this.camera = Camera.createPerspective(CAMERA_FOV, CAMERA_RATIO, CAMERA_ZNEAR, CAMERA_ZFAR);
        this.cameraOrtho = Camera.createOrthographic(CAMERA_ORTHO_WIDTH, CAMERA_ORTHO_HEIGHT, CAMERA_ZNEAR, CAMERA_ZFAR);

        this._waitLoad();
    }

    private _waitLoad(): void {
        if (TexturesManager.isReady()) {
            this._scene = new DemoScene(this, this._renderer);
            this._scene.init();

            this._loop();
        } else {
            requestAnimationFrame(() => { this._waitLoad(); });
        }
    }

    private _loop(): void {
        this._renderer.clear();
        this._scene.render();

        requestAnimationFrame(() => { this._loop(); });
    }
}

window.onload = () => {
    return new App();
};

export default App;