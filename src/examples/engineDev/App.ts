import { Renderer, Camera, Scene, MaterialForward, Instance, Input, Vector3, Joint, Armature, loadJSON, JSONGeometry } from '../../engine';
import { JSONModel } from '../../engine/geometries/JSONGeometry';

const keyboard = new Array(255)
let topJoint: Joint;

let loadedInst: Instance;
function loadModel(scene: Scene) {
    loadJSON("data/cube.json", (model: JSONModel) => {
        const geo = new JSONGeometry(model);
        const mat = new MaterialForward();
        loadedInst = new Instance(geo, mat);

        mat.receiveLight = true;

        loadedInst.armature = Armature.createArmatureFromJSONModel(model);
        topJoint = loadedInst.armature.joints[0];

        topJoint.rotation.rotateZ(45*Math.PI/180);
        loadedInst.armature.updatePose();

        scene.addGameObject(loadedInst);
    });
}

class App {
    constructor() {
        const render = new Renderer(854, 480);
        document.getElementById("divGame").appendChild(render.canvas);

        Input.init(render.canvas);
        Input.onKeydown((keycode: number) => { this._handleKeyboard(keycode, 1); });
        Input.onKeyup((keycode: number) => { this._handleKeyboard(keycode, 0); });

        const camera = Camera.createPerspective(90, 854/480, 0.1, 1000.0);
        camera.rotation.local = true;
        camera.position.set(10, 10, 10);
        camera.rotation.lookToDirection(new Vector3(-10,-6,-10));
        
        const scene = new Scene();
        scene.directionalLight.ambientIntensity = 0.2;
        scene.directionalLight.diffuseIntensity = 0.8;
        scene.directionalLight.direction.set(-1, -1, -1);

        loadModel(scene);

        scene.init();
        
        this._loop(render, camera, loadedInst, scene);
    }

    private _handleKeyboard(key: number, status: number): void {
        keyboard[key] = status;
    }

    private _updateRotation(inst: Instance): void {
        const angle = 3*Math.PI/180;
        if (keyboard[81]) {
            inst.rotation.rotateX(angle);
        } else if (keyboard[65]) {
            inst.rotation.rotateX(-angle);
        }

        if (keyboard[87]) {
            inst.rotation.rotateY(angle);
        } else if (keyboard[83]) {
            inst.rotation.rotateY(-angle);
        }

        if (keyboard[69]) {
            inst.rotation.rotateZ(angle);
        } else if (keyboard[68]) {
            inst.rotation.rotateZ(-angle);
        }

        if (keyboard[79]) {
            topJoint.rotation.rotateZ(angle);
            loadedInst.armature.updatePose();
        } else if (keyboard[76]) {
            topJoint.rotation.rotateZ(-angle);
            loadedInst.armature.updatePose();
        }

        if (keyboard[82]) {
            inst.rotation.setIdentity();
        }
    }

    private _loop(render: Renderer, camera: Camera, inst: Instance, scene: Scene): void {
        render.clear();

        this._updateRotation(inst);

        scene.update();

        scene.render(render, camera);

        requestAnimationFrame(() => this._loop(render, camera, loadedInst, scene));
    }
}

window.onload = () => new App();