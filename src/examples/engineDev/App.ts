import { Renderer, Camera, Scene, CubeGeometry, ColorMaterial, Vector4, Instance, PlaneGeometry } from '../../engine';

class App {
    constructor() {
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);

        const render_2 = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render_2.canvas);

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.position.set(10, 10, 10);
        camera.lookTo.set(0, 0, 0);

        const camera_2 = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera_2.position.set(0, 0, 10);
        camera_2.lookTo.set(0, 0, 0);
        
        const geo = new CubeGeometry(2, 2, 2);
        const mat = new ColorMaterial(new Vector4(1.0, 1.0, 1.0, 1.0));
        const inst = new Instance(geo, mat);

        const geo2 = new PlaneGeometry(5, 5);
        const mat2 = new ColorMaterial(new Vector4(0.0, 1.0, 0.0, 1.0));
        const inst2 = new Instance(geo2, mat2);
        inst2.position.y = -1;

        inst.addChild(camera);

        const scene = new Scene();
        scene.addGameObject(inst);
        scene.addGameObject(inst2);

        scene.init();

        this._loop(render, render_2, camera, camera_2, inst, scene);
    }

    private _loop(render: Renderer, render_2: Renderer, camera: Camera, camera_2: Camera, inst: Instance, scene: Scene) {
        render.clear();
        render_2.clear();

        //inst.rotation.y += 0.5 * Math.PI / 180;

        camera.lookTo.set(0,0,0);

        scene.update();

        scene.render(render, camera);
        scene.render(render_2, camera_2);

        requestAnimationFrame(() => this._loop(render, render_2, camera, camera_2, inst, scene));
    }
}

window.onload = () => new App();