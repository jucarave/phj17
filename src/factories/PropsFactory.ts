import Renderer from '../engine/Renderer';
import Texture from '../engine/Texture';
import BoxCollision from '../engine/collisions/BoxCollision';
import Material from '../engine/materials/Material';
import BasicMaterial from '../engine/materials/BasicMaterial';
import WallGeometry from '../engine/geometries/WallGeometry';
import Instance from '../engine/entities/Instance';
import Text from '../engine/entities/Text';
import { Vector3, vec3 } from '../engine/math/Vector3';
import TexturesManager from '../managers/TexturesManager';
import { TexturesNames } from '../managers/TexturesManager';
import ModelsManager from '../managers/ModelsManager';
import { ModelNames } from '../managers/ModelsManager';

export type PropsNames = 'Model3D' | 'Text';

export interface PropOptions {
    model?: string;
    texture?: string;
    material?: Material;
    position?: Vector3;
    rotation?: Vector3;
    culling?: boolean;
    opaque?: boolean;

    text?: string;
    font?: string;
    size?: number;
}

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
    
    private static _processObjectProperties(object: Instance, options: PropOptions): Instance {
        if (options.position) { object.translate(options.position.x, options.position.y, options.position.z); }
        if (options.rotation) { object.rotate(options.rotation.x, options.rotation.y, options.rotation.z); }

        if (options.culling) { object.material.setCulling(options.culling); }
        if (options.opaque) { object.material.setOpaque(options.opaque); }

        return object;
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

    public static create3DModel(renderer: Renderer, options: PropOptions): Instance {
        let material: Material = null,
            model = ModelsManager.getModel(<ModelNames>options.model),
            object: Instance;

        if (model.material) {
            material = model.material;
        }else if (options.texture) {
            material = this._createMaterial(renderer, TexturesManager.getTexture(<TexturesNames>options.texture));
        } else if (options.material) {
            material = options.material;
        }

        object = new Instance(renderer, model.geometry, material);

        return this._processObjectProperties(object, options);
    }

    public static createText(renderer: Renderer, options: PropOptions): Text {
        return new Text(renderer, options.text, options.font, {position: options.position, rotation: options.rotation, size: options.size});
    }

    public static createProp(renderer: Renderer, propName: string, options?: PropOptions): Instance {
        let name = <PropsNames>propName,
            obj: Instance;

        switch (name) {
            /*case 'BarFloorSign':
                obj = PropsFactory.createBarFloorSign(renderer, position);
                break;*/
                
            case 'Model3D':
                obj = PropsFactory.create3DModel(renderer, options);
                break;
                
            case 'Text':
                obj = PropsFactory.createText(renderer, options);
                break;

            default:
                throw new Error("Prop [" + propName + "] not found!");
        }

        return obj;
    }
}

export default PropsFactory;