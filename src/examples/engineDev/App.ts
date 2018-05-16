import { Renderer, Camera, Scene, CubeGeometry, ColorMaterial, Vector4, Instance } from '../../engine';

class App {
    constructor() {
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas)

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.setPosition(10, 10, 10);
        camera.setTarget(0, 0, 0);
        
        const geo = new CubeGeometry(2, 2, 2);
        const mat = new ColorMaterial(new Vector4(1.0, 1.0, 1.0, 1.0));
        const inst = new Instance(geo, mat);

        const scene = new Scene();
        scene.setCamera(camera);
        scene.addGameObject(inst);

        scene.init();

        this._loop(render, scene);
    }

    private _loop(render: Renderer, scene: Scene) {
        render.clear();

        scene.render(render);

        requestAnimationFrame(() => this._loop(render, scene));
    }
}

window.onload = () => new App();