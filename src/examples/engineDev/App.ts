import { Renderer, Camera, Scene, MaterialForward, Instance, Input, Vector3, CylinderGeometry } from '../../engine';

const keyboard = new Array(255);

function addJoinWeightsToGeometry(geometry: CylinderGeometry, steps: number) {
    for (let i=0;i<steps;i++) {
        geometry.addJointWeights(0, 1.0, 1, 0.0);
        geometry.addJointWeights(0, 1.0, 1, 0.0);
        geometry.addJointWeights(0, 0.75, 1, 0.25);
        geometry.addJointWeights(0, 0.75, 1, 0.25);
    }

    for (let i=0;i<steps;i++) {
        geometry.addJointWeights(0, 0.75, 1, 0.25);
        geometry.addJointWeights(0, 0.75, 1, 0.25);
        geometry.addJointWeights(0, 0.5, 1, 0.5);
        geometry.addJointWeights(0, 0.5, 1, 0.5);
    }

    for (let i=0;i<steps;i++) {
        geometry.addJointWeights(0, 0.5, 1, 0.5);
        geometry.addJointWeights(0, 0.5, 1, 0.5);
        geometry.addJointWeights(0, 0.25, 1, 0.75);
        geometry.addJointWeights(0, 0.25, 1, 0.75);
    }

    for (let i=0;i<steps;i++) {
        geometry.addJointWeights(0, 0.25, 1, 0.75);
        geometry.addJointWeights(0, 0.25, 1, 0.75);
        geometry.addJointWeights(0, 0.0, 1, 1.0);
        geometry.addJointWeights(0, 0.0, 1, 1.0);
    }
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
        
        const geo = new CylinderGeometry(2.0, 8, 10, 5);
        addJoinWeightsToGeometry(geo, 8);

        const mat = new MaterialForward();
        const inst = new Instance(geo, mat);

        inst.scale.x = 2;
        inst.scale.z = 0.5;

        mat.receiveLight = true;
        mat.addConfig("USE_ARMATURE");
        mat.setTextureUv(1/32,1/32,16/32,16/32);

        const scene = new Scene();
        scene.addGameObject(inst);
        scene.directionalLight.ambientIntensity = 0.2;
        scene.directionalLight.diffuseIntensity = 0.8;
        scene.directionalLight.direction.set(-1, -1, -1);

        scene.init();
        
        this._loop(render, camera, inst, scene);
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

        if (keyboard[82]) {
            inst.rotation.setIdentity();
        }
    }

    private _loop(render: Renderer, camera: Camera, inst: Instance, scene: Scene): void {
        render.clear();

        this._updateRotation(inst);

        scene.update();

        scene.render(render, camera);

        requestAnimationFrame(() => this._loop(render, camera, inst, scene));
    }
}

window.onload = () => new App();