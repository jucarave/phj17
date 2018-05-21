import { Renderer, Camera, Scene, CubeGeometry, ColorMaterial, Vector4, Instance, PlaneGeometry, Vector3 } from '../../engine';

class App {
    constructor() {
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);

        const render_2 = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render_2.canvas);

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.position.set(0, 0, 10);
        camera.rotation.lookToDirection(new Vector3(0, 0, -10));

        const camera_2 = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera_2.position.set(-10, -10, -10);
        camera_2.rotation.lookToDirection(new Vector3(10, 10, 10));
        
        const geo = new CubeGeometry(2, 2, 2);
        const mat = new ColorMaterial(new Vector4(1.0, 1.0, 1.0, 1.0));
        const inst = new Instance(geo, mat);

        const geo2 = new PlaneGeometry(5, 5);
        const mat2 = new ColorMaterial(new Vector4(0.0, 1.0, 0.0, 1.0));
        const inst2 = new Instance(geo2, mat2);
        inst2.position.y = -1;

        const geo3 = new CubeGeometry(0.5, 0.5, 0.5);
        const mat3 = new ColorMaterial(new Vector4(0.0, 0.0, 1.0, 1.0));
        const inst3 = new Instance(geo3, mat3);
        inst3.position.x = -0.5;
        inst3.position.y = -0.75;
        inst3.position.z = 2.25;

        const geo4 = new CubeGeometry(0.5, 0.5, 0.5);
        const mat4 = new ColorMaterial(new Vector4(1.0, 0.0, 0.0, 1.0));
        const inst4 = new Instance(geo4, mat4);
        inst4.position.x = 0.5;
        inst4.position.y = -0.75;
        inst4.position.z = 2.25;

        //inst.addChild(camera);

        const scene = new Scene();
        scene.addGameObject(inst);
        scene.addGameObject(inst2);
        scene.addGameObject(inst3);
        scene.addGameObject(inst4);

        scene.init();

        this._quaternionTest();

        this._loop(render, render_2, camera, camera_2, inst, scene);
    }

    private _quaternionTest() {
        const v = new Vector3(0, 1, 0),
            axis = new Vector3(1, 0, 0),
            angle = 90 * Math.PI / 180;

        console.log(v.rotateOnAxis(angle, axis));
    }

    private _loop(render: Renderer, render_2: Renderer, camera: Camera, camera_2: Camera, inst: Instance, scene: Scene) {
        render.clear();
        render_2.clear();

        //inst.rotation.z += 0.5 * Math.PI / 180;

        //camera_2.rotation.y += 3 * Math.PI / 180;

        scene.update();

        scene.render(render, camera_2);
        //scene.render(render_2, camera_2);

        requestAnimationFrame(() => this._loop(render, render_2, camera, camera_2, inst, scene));
    }
}

window.onload = () => new App();