import { Renderer, Camera, Scene, CubeGeometry, ColorMaterial, Vector4, Instance, Input, Vector3 } from '../../engine';

const keyboard = new Array(255);

class App {
    constructor() {
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);

        Input.init(render.canvas);
        Input.onKeydown((keycode: number) => { this._handleKeyboard(keycode, 1); });
        Input.onKeyup((keycode: number) => { this._handleKeyboard(keycode, 0); });

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.position.set(10, 10, 10);
        //camera.rotation.lookToDirection(new Vector3(7, 7, 7));
        camera.useQuaternion = true;
        camera.quaternion.local = true;
        camera.quaternion.lookToDirection(new Vector3(-10, -10, -10));
        //camera.quaternion.rotateY(45*Math.PI/180);
        
        const geo = new CubeGeometry(0.5, 2, 4);
        const mat = new ColorMaterial(new Vector4(1.0, 1.0, 1.0, 1.0));
        const inst = new Instance(geo, mat);
        inst.rotation.order = "ZYX";
        inst.useQuaternion = false;
        inst.quaternion.local = true;

        const geo2 = new CubeGeometry(10, 0.1, 0.1);
        const mat2 = new ColorMaterial(new Vector4(1.0, 0.0, 0.0, 1.0));
        const inst2 = new Instance(geo2, mat2);

        const geo3 = new CubeGeometry(0.1, 10, 0.1);
        const mat3 = new ColorMaterial(new Vector4(0.0, 1.0, 0.0, 1.0));
        const inst3 = new Instance(geo3, mat3);

        const geo4 = new CubeGeometry(0.1, 0.1, 10);
        const mat4 = new ColorMaterial(new Vector4(0.0, 0.0, 1.0, 1.0));
        const inst4 = new Instance(geo4, mat4);

        inst.addChild(inst2);
        inst.addChild(inst3);
        inst.addChild(inst4);

        const scene = new Scene();
        scene.addGameObject(inst);
        scene.addGameObject(inst2);
        scene.addGameObject(inst3);
        scene.addGameObject(inst4);

        scene.init();

        //inst.quaternion.multiplyQuaternion(Quaternion.createRotationOnAxis(-90*Math.PI/180, new Vector3(0, -1, 0)));
        //inst.quaternion.rotateY((Math.random()*360)*Math.PI/180);
        //inst.quaternion.rotateZ((Math.random()*360)*Math.PI/180);
        
        this._loop(render, camera, inst, scene);
    }

    private _handleKeyboard(key: number, status: number): void {
        keyboard[key] = status;
    }

    private _updateRotation(inst: Instance): void {
        const angle = 3*Math.PI/180;
        if (keyboard[81]) {
            inst.quaternion.rotateX(angle);
            inst.rotation.x += angle;
        } else if (keyboard[65]) {
            inst.quaternion.rotateX(-angle);
            inst.rotation.x -= angle;
        }

        if (keyboard[87]) {
            inst.quaternion.rotateY(angle);
            inst.rotation.y += angle;
        } else if (keyboard[83]) {
            inst.quaternion.rotateY(-angle);
            inst.rotation.y -= angle;
        }

        if (keyboard[69]) {
            inst.quaternion.rotateZ(angle);
            inst.rotation.z += angle;
        } else if (keyboard[68]) {
            inst.quaternion.rotateZ(-angle);
            inst.rotation.z -= angle;
        }

        if (keyboard[82]) {
            inst.quaternion.setIdentity();
            inst.rotation.set(0, 0, 0);
        }
    }

    private _loop(render: Renderer, camera: Camera, inst: Instance, scene: Scene): void {
        render.clear();

        //inst.rotation.x += 3 * Math.PI / 180;
        //inst.rotation.y += 3 * Math.PI / 180;
        //inst.rotation.z += 3 * Math.PI / 180;/**/

        
        //inst.quaternion.rotateX(3*Math.PI/180);
        //inst.quaternion.rotateY(3*Math.PI/180);
        //inst.quaternion.rotateZ(3*Math.PI/180);/**/

        //camera_2.rotation.y += 3 * Math.PI / 180;

        //camera.quaternion.rotateZ(0.5*Math.PI/180);

        this._updateRotation(inst);

        scene.update();

        scene.render(render, camera);
        //scene.render(render_2, camera_2);

        requestAnimationFrame(() => this._loop(render, camera, inst, scene));
    }
}

window.onload = () => new App();