import { Renderer, Camera, Scene, CubeGeometry, ColorMaterial, Vector4, Instance } from '../../engine';

class App {
    constructor() {
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);

        const render_2 = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render_2.canvas);

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.setPosition(10, 10, 10);
        camera.setTarget(0, 0, 0);

        const camera_2 = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera_2.setPosition(0, 0, 10);
        camera_2.setTarget(0, 0, 0);
        
        const geo = new CubeGeometry(2, 2, 2);
        const mat = new ColorMaterial(new Vector4(1.0, 1.0, 1.0, 1.0));
        const inst = new Instance(geo, mat);

        const scene = new Scene();
        scene.addGameObject(inst);

        scene.init();

        this._loop(render, render_2, camera, camera_2, inst, scene);
    }

    private _loop(render: Renderer, render_2: Renderer, camera: Camera, camera_2: Camera, inst: Instance, scene: Scene) {
        render.clear();
        render_2.clear();

        inst.rotation.y += 3 * Math.PI / 180;

        scene.update();

        scene.render(render, camera);
        scene.render(render_2, camera_2);

        requestAnimationFrame(() => this._loop(render, render_2, camera, camera_2, inst, scene));
    }
}

window.onload = () => new App();