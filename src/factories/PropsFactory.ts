import Renderer from '../engine/Renderer';
import Texture from '../engine/Texture';
import BoxCollision from '../engine/collisions/BoxCollision';
import Material from '../engine/materials/Material';
import BasicMaterial from '../engine/materials/BasicMaterial';
import WallGeometry from '../engine/geometries/WallGeometry';
import Instance from '../entities/Instance';
import Text from '../entities/Text';
import { Vector3, vec3 } from '../math/Vector3';
import TexturesManager from '../managers/TexturesManager';
import ModelsManager from '../managers/ModelsManager';
import { ModelNames } from '../managers/ModelsManager';

export type PropsNames = 'BarFloorSign' | 'Dumpster' | 'BarSign' | 'BarWindow' | 'Text' | 'BarDoorFrame';

abstract class PropsFactory {
    private static _createMaterial(renderer: Renderer, texture: Texture, uv?: Array<number>, repeat?: Array<number>): Material {
        let ret = new BasicMaterial(texture, renderer);

        if (repeat) ret.setRepeat(repeat[0], repeat[1]);
        if (uv) ret.setUv(uv[0], uv[1], uv[2], uv[3]);

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
            texture = TexturesManager.getTexture("CITY"),
            material = this._createMaterial(renderer, texture, this._getUVS(texture, 19, 27, width, height), [1, 1]).setOpaque(false),
            geometry = new WallGeometry(renderer, width/16, height/16),
            object = new Instance(renderer, geometry, material);

        object.translate(position.x, position.y + height / 32, position.z);
        object.isBillboard = true;

        object.setCollision(new BoxCollision(vec3(position.x-width/32, position.y, position.z-width/32), vec3(width/16, height/16, width/16)));

        return object;
    }
    
    public static createDumpster(renderer: Renderer, position: Vector3, rotation?: Vector3): Instance {
        let width = 16, height = 16, length = 32,
            texture = TexturesManager.getTexture("CITY"),
            material = this._createMaterial(renderer, texture).setCulling(true),
            model = ModelsManager.getModel("Dumpster"),
            object = new Instance(renderer, model.geometry, material);

        object.translate(position.x, position.y, position.z);
        if (rotation) object.rotate(rotation.x, rotation.y, rotation.z);

        object.setCollision(new BoxCollision(vec3(position.x-width/32, position.y, position.z-length/32), vec3(width/16, height/16, length/16)));

        return object;
    }
    
    public static create3DModel(renderer: Renderer, modelName: ModelNames, culling: boolean, opaque: boolean, position: Vector3, rotation?: Vector3): Instance {
        let texture = TexturesManager.getTexture("CITY"),
            material = this._createMaterial(renderer, texture).setCulling(culling).setOpaque(opaque),
            model = ModelsManager.getModel(modelName),
            object = new Instance(renderer, model.geometry, material);

        object.translate(position.x, position.y, position.z);
        if (rotation) object.rotate(rotation.x, rotation.y, rotation.z);

        return object;
    }

    public static createText(renderer: Renderer, position: Vector3, rotation?: Vector3, options?: any): Text {
        return new Text(renderer, options.text, options.font, {position: position, rotation: rotation, size: options.size});
    }

    public static createProp(renderer: Renderer, propName: string, position: Vector3, rotation?: Vector3, options?: any): Instance {
        let name = <PropsNames>propName,
            obj: Instance;

        rotation;

        switch (name) {
            case 'BarFloorSign':
                obj = PropsFactory.createBarFloorSign(renderer, position);
                break;

            case 'Dumpster':
                obj = PropsFactory.createDumpster(renderer, position, rotation);
                break;
                
            case 'BarSign':
                obj = PropsFactory.create3DModel(renderer, "BarSign", true, true, position, rotation);
                break;
                
            case 'BarWindow':
                obj = PropsFactory.create3DModel(renderer, "BarWindow", false, true, position, rotation);
                break;
                
            case 'BarDoorFrame':
                obj = PropsFactory.create3DModel(renderer, "BarDoorFrame", false, true, position, rotation);
                break;
                
            case 'Text':
                obj = PropsFactory.createText(renderer, position, rotation, options);
                break;

            default:
                throw new Error("Prop [" + propName + "] not found!");
        }

        return obj;
    }
}

export default PropsFactory;