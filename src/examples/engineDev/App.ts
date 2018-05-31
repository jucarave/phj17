import { Renderer, Camera, Scene, CubeGeometry, MaterialForward, Instance, Input, Vector3, Texture } from '../../engine';

const keyboard = new Array(255);

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
        camera.rotation.lookToDirection(new Vector3(-10,-10,-10));
        
        const geo = new CubeGeometry(4, 4, 4);
        const text = new Texture('img/texture.png');
        const mat = new MaterialForward();
        const inst = new Instance(geo, mat);

        mat.texture = text;
        mat.setTextureUv(1/32,1/32,16/32,16/32);


        const geo2 = new CubeGeometry(0.5, 0.5, 0.5);
        const mat2 = new MaterialForward();
        const inst2 = new Instance(geo2, mat2);
        mat2.setColor(1.0, 0.0, 0.0, 1.0);
        inst2.position.x = 3;

        const geo3 = new CubeGeometry(0.5, 0.5, 0.5);
        const mat3 = new MaterialForward();
        const inst3 = new Instance(geo3, mat3);
        mat3.setColor(0.0, 1.0, 0.0, 1.0);
        inst3.position.y = 3;

        const scene = new Scene();
        scene.addGameObject(inst2);
        scene.addGameObject(inst);
        scene.addGameObject(inst3);

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