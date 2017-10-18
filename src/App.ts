declare var Stats: any;

import Renderer from './engine/Renderer';
import Input from './engine/Input';
import Scene from './engine/Scene';
import Camera from './engine/Camera';
import TexturesManager from './managers/TexturesManager';
import ModelsManager from './managers/ModelsManager';
import SectorsManager from './managers/SectorsManager';
import DemoScene from './scenes/DemoScene';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CAMERA_FOV, CAMERA_RATIO, CAMERA_ZFAR, CAMERA_ZNEAR, CAMERA_ORTHO_HEIGHT, CAMERA_ORTHO_WIDTH } from './engine/Constants';

class App {
    private _renderer                   : Renderer;
    private _scene                      : Scene;
    
    private _stats = new Stats();
    
    public readonly camera              : Camera;
    public readonly cameraOrtho         : Camera;

    constructor() {
        this._renderer = new Renderer(CANVAS_WIDTH, CANVAS_HEIGHT, document.getElementById("divGame"));

        Input.init(this._renderer.canvas);
        TexturesManager.init(this._renderer);
        ModelsManager.init(this._renderer);
        SectorsManager.init(this._renderer);

        this.camera = Camera.createPerspective(CAMERA_FOV, CAMERA_RATIO, CAMERA_ZNEAR, CAMERA_ZFAR);

        this.cameraOrtho = Camera.createOrthographic(CAMERA_ORTHO_WIDTH, CAMERA_ORTHO_HEIGHT, CAMERA_ZNEAR, CAMERA_ZFAR);
        this.cameraOrtho.setPosition(0, 0, 5);
        this.cameraOrtho.setTarget(0, 0, 0);

        this._waitLoad();
    }

    private _waitLoad(): void {
        if (TexturesManager.isReady() && ModelsManager.isReady()) {
            this._scene = new DemoScene(this, this._renderer);
            this._scene.init();

            this._stats.showPanel(1);
            document.body.appendChild(this._stats.dom);

            this._loop();
        } else {
            requestAnimationFrame(() => { this._waitLoad(); });
        }
    }

    private _loop(): void {
        this._stats.begin();
        
        this._scene.update();

        this._renderer.clear();
        this._scene.render();

        this._stats.end();

        requestAnimationFrame(() => { this._loop(); });
    }
}

window.onload = () => {
    document.body.removeChild(document.getElementsByTagName("h1")[0]);
    return new App();
};

export default App;