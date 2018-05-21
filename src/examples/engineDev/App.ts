import { Renderer, Camera, Scene, CubeGeometry, ColorMaterial, Vector4, Instance, Vector3, Quaternion, Matrix4 } from '../../engine';

class App {
    constructor() {
        this._quaternionTest();
        
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.position.set(-10, -10, -10);
        camera.rotation.lookToDirection(new Vector3(10, 10, 10));
        
        const geo = new CubeGeometry(2, 2, 0.5);
        const mat = new ColorMaterial(new Vector4(1.0, 1.0, 1.0, 1.0));
        const inst = new Instance(geo, mat);
        inst.useQuaternion = true;

        //inst.addChild(camera);

        const scene = new Scene();
        scene.addGameObject(inst);

        scene.init();

        this._loop(render, camera, inst, scene);
    }

    private _quaternionTest() {
        const qBase = new Quaternion();

        qBase.multiplyQuaternion((new Quaternion(45*Math.PI/180, new Vector3(0, 0, 1))).toUnitNormQuaternion());
        qBase.multiplyQuaternion((new Quaternion(90*Math.PI/180, new Vector3(0, -1, 0))).toUnitNormQuaternion());
        qBase.multiplyQuaternion((new Quaternion(0*Math.PI/180, new Vector3(1, 0, 0))).toUnitNormQuaternion());

        qBase.getRotationMatrix().printDebug();
        console.log("=====");
        Matrix4.createZRotation(45*Math.PI/180)
            .multiply(Matrix4.createYRotation(90*Math.PI/180))
            .multiply(Matrix4.createXRotation(0*Math.PI/180))
            .printDebug();
    }

    private _loop(render: Renderer, camera: Camera, inst: Instance, scene: Scene) {
        render.clear();

        //inst.rotation.z += 0.5 * Math.PI / 180;

        //camera_2.rotation.y += 3 * Math.PI / 180;

        scene.update();

        scene.render(render, camera);
        //scene.render(render_2, camera_2);

        requestAnimationFrame(() => this._loop(render, camera, inst, scene));
    }
}

window.onload = () => new App();