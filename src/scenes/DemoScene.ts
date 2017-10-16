import Scene from '../engine/Scene';
import Renderer from '../engine/Renderer';
import Texture from '../engine/Texture';
import CubeGeometry from '../engine/geometries/CubeGeometry';
import PlaneGeometry from '../engine/geometries/PlaneGeometry';
import WallGeometry from '../engine/geometries/WallGeometry';
import Material from '../engine/materials/Material';
import BasicMaterial from '../engine/materials/BasicMaterial';
import Instance from '../entities/Instance';
import Text from '../entities/Text';
import EntityFactory from '../factories/EntityFactory';
import PropsFactory from '../factories/PropsFactory';
import { Vector3, vec3 } from '../math/Vector3';
import TexturesManager from '../TexturesManager';
import ModelsManager from '../ModelsManager';
import App from '../App';
import HUDScene from './HUDScene';

class DemoScene extends Scene {
    private _hud: HUDScene;

    constructor(app: App, renderer: Renderer) {
        super(app, renderer);

        this._buildScene();
    }

    private _addCube(position: Vector3, size: Vector3, material: Material): void {
        let geometry = new CubeGeometry(this._renderer, size.x, size.y, size.z),
        object = new Instance(this._renderer, geometry, material);

        object.translate(position.x, position.y, position.z);

        this.addGameObject(object);
    }

    private _addPlane(position: Vector3, size: Vector3, material: Material): void {
        let geometry = new PlaneGeometry(this._renderer, size.x, size.y),
            object = new Instance(this._renderer, geometry, material);

        object.translate(position.x, position.y, position.z);

        this.addGameObject(object);
    }
    
    private _addWall(position: Vector3, rotation: Vector3, size: Vector3, material: Material): void {
        let geometry = new WallGeometry(this._renderer, size.x, size.y),
            object = new Instance(this._renderer, geometry, material);

        object.translate(position.x, position.y, position.z);
        object.rotate(rotation.x, rotation.y, rotation.z);

        this.addGameObject(object);
    }

    private _getUVS(texture: Texture, x: number, y: number, w: number, h: number): Array<number> {
        return [
            x / texture.width,
            y / texture.height,
            w / texture.width,
            h / texture.height
        ];
    }

    private _createMaterial(texture: Texture, uv?: Array<number>, repeat?: Array<number>): Material {
        let ret = new BasicMaterial(texture, this._renderer);

        if (repeat) ret.setRepeat(repeat[0], repeat[1]);
        if (uv) ret.setUv(uv[0], uv[1], uv[2], uv[3]);

        return ret;
    }

    private _buildScene(): void {
        let camera = this._app.camera,
            player = EntityFactory.createPlayer(this._renderer, camera),
            texture = TexturesManager.getTexture("TEXTURE_16"),
            texCity = TexturesManager.getTexture("CITY");

        // Create materials for this scene
        let matFloor = this._createMaterial(texCity, this._getUVS(texCity, 1, 1, 16, 16), [9, 3]),
            matbackWall = this._createMaterial(texture, this._getUVS(texture, 19, 1, 16, 16), [3, 2]),
            matWallL = this._createMaterial(texture, this._getUVS(texture, 19, 1, 16, 16), [9, 8]),
            matWallR = this._createMaterial(texture, this._getUVS(texture, 19, 1, 16, 16), [9, 3]),
            matFence = this._createMaterial(texCity, this._getUVS(texCity, 19, 1, 16, 24), [3, 1]).setOpaque(false).setCulling(true),
            matCube = this._createMaterial(texture, this._getUVS(texture, 37, 1, 16, 16), [1, 1]);

        this._addPlane(vec3(4.5, 0.0, 0.0), vec3(9.0, 3.0), matFloor);
        
        this._addWall(vec3(8.0, 0.75, 0.0), vec3(0.0, 3/2*Math.PI, 0.0), vec3(3.0, 1.5), matFence);
        this._addWall(vec3(0.0, 1.0, 0.0), vec3(0.0, Math.PI/2, 0.0), vec3(3.0, 2.0), matbackWall);
        this._addWall(vec3(4.5, 4.0, -1.5), vec3(0.0, 0.0, 0.0), vec3(9.0, 8.0), matWallL);
        this._addWall(vec3(4.5, 1.5, 1.5), vec3(0.0, Math.PI, 0.0), vec3(9.0, 3.0), matWallR);

        // Dumpster
        this._addCube(vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), matCube);
        this._addCube(vec3(0.5, 0.5, -0.5), vec3(1.0, 1.0, 1.0), matCube);

        // Canisters
        this._addCube(vec3(4.5, 0.5, -1.0), vec3(1.0, 1.0, 1.0), matCube);
        this._addCube(vec3(5.5, 0.5, -1.0), vec3(1.0, 1.0, 1.0), matCube);

        // Props
        this.addGameObject(PropsFactory.createBarFloorSign(this._renderer, vec3(2.0, 0.0, 1.0)));

        // Text
        this.addGameObject(new Text(this._renderer, "A Game By", "retganon", {size: 36, position: vec3(3.0, 1.0, 0.0), rotation: vec3(0.0, 3/2*Math.PI, 0.0)}));
        this.addGameObject(new Text(this._renderer, "Jucarave", "retganon", {size: 36, position: vec3(5.0, 1.0, 0.0), rotation: vec3(0.0, 3/2*Math.PI, 0.0)}));
        //this.addGameObject(new Text(this._renderer, "pixelhorrorjam2017", "retganon", {size: 36, position: vec3(7.0, 1.0, 0.0), rotation: vec3(0.0, 3/2*Math.PI, 0.0)}));

        // Sign
        let model = ModelsManager.getModel("BarSign"),
            modMat = this._createMaterial(texture),
            sign = new Instance(this._renderer, model.geometry, modMat);

        modMat.setCulling(true);
        this.addGameObject(sign.translate(3.0, 1.5, 1.5).rotate(0, Math.PI/2, 0));
        
        
        this.addGameObject(player.translate(1.0, 0.0, 0.0));
        this.setCamera(camera);

        this._hud = new HUDScene(this._app, this._renderer);
    }

    public render(): void {
        super.render();

        this._hud.render();
    }
}

export default DemoScene;