import Renderer from '../engine/Renderer';
import Texture from '../engine/Texture';
import BoxCollision from '../engine/collisions/BoxCollision';
import Material from '../engine/materials/Material';
import BasicMaterial from '../engine/materials/BasicMaterial';
import WallGeometry from '../engine/geometries/WallGeometry';
import Instance from '../entities/Instance';
import { Vector3, vec3 } from '../math/Vector3';
import TexturesManager from '../managers/TexturesManager';

export type PropsNames = 'BarFloorSign';

abstract class PropsFactory {
    private static _createMaterial(renderer: Renderer, texture: Texture, uv: Array<number>, repeat: Array<number>): Material {
        let ret = new BasicMaterial(texture, renderer);

        ret.setRepeat(repeat[0], repeat[1]);
        ret.setUv(uv[0], uv[1], uv[2], uv[3]);

        return ret;
    }
    
    private static _getUVS(texture: Texture, x: number, y: number, w: number, h: number): Array<number> {
        return [
            x / texture.width,
            y / texture.height,
            w / texture.width,
            h / texture.height
        ];
    }

    public static createBarFloorSign(renderer: Renderer, position: Vector3): Instance {
        let width = 10, height = 11,
            texture = TexturesManager.getTexture("PROPS"),
            material = this._createMaterial(renderer, texture, this._getUVS(texture, 1, 1, width, height), [1, 1]).setOpaque(false),
            geometry = new WallGeometry(renderer, width/16, height/16),
            object = new Instance(renderer, geometry, material);

        object.translate(position.x, position.y + height / 32, position.z);
        object.isBillboard = true;

        object.setCollision(new BoxCollision(vec3(position.x-width/32, position.y, position.z-width/32), vec3(width/16, height/16, width/16)));

        return object;
    }

    public static createProp(renderer: Renderer, propName: string, position: Vector3, rotation?: Vector3): Instance {
        let name = <PropsNames>propName,
            obj: Instance;

        rotation;

        switch (name) {
            case 'BarFloorSign':
                obj = PropsFactory.createBarFloorSign(renderer, position);
                break;

            default:
                throw new Error("Prop [" + propName + "] not found!");
        }

        return obj;
    }
}

export default PropsFactory;