import Renderer from 'engine/Renderer';
import Texture from 'engine/Texture';
import { PI_2, PI3_2 } from 'engine/Constants';
import Material from 'engine/materials/Material';
import BasicMaterial from 'engine/materials/BasicMaterial';
import WallGeometry from 'engine/geometries/WallGeometry';
import PlaneGeometry from 'engine/geometries/PlaneGeometry';
import Instance from 'engine/entities/Instance';
import Text from 'engine/entities/Text';
import { Vector3 } from 'engine/math/Vector3';
import { Vector4 } from 'engine/math/Vector4';
import TexturesManager from 'managers/TexturesManager';
import { TexturesNames } from 'managers/TexturesManager';
import ModelsManager from 'managers/ModelsManager';
import { ModelNames } from 'managers/ModelsManager';

export type PropsNames = 'Model3D' | 'Text' | 'Floor' | 'Wall';

export interface PropOptions {
    model?: string;
    
    texture?: string;
    material?: Material;
    uv?: Vector4;
    repeat?: Array<number>;
    
    position?: Vector3;
    rotation?: Vector3;
    size?: Vector3;
    
    culling?: boolean;
    opaque?: boolean;
    billboard?: boolean;

    text?: string;
    font?: string;
    fontSize?: number;
}

abstract class PropsFactory {
    private static _createMaterial(renderer: Renderer, texture: Texture, uv?: Vector4, repeat?: Array<number>): Material {
        let ret = new BasicMaterial(texture, renderer);

        if (repeat) ret.setRepeat(repeat[0], repeat[1]);
        if (uv) ret.setUv(uv.x, uv.y, uv.z, uv.w);

        return ret;
    }
    
    private static _getUVS(texture: Texture, x: number|Vector4, y?: number, w?: number, h?: number): Vector4 {
        let _x: number;

        if ((<Vector4>x).length !== undefined) {
            _x = (<Vector4>x).x;
            y = (<Vector4>x).y;
            w = (<Vector4>x).z;
            h = (<Vector4>x).w;
        }

        return new Vector4(
            _x / texture.width,
            y / texture.height,
            w / texture.width,
            h / texture.height
        );
    }
    
    private static _processObjectProperties(object: Instance, options: PropOptions): Instance {
        if (options.position) { object.translate(options.position.x, options.position.y, options.position.z, true); }
        if (options.rotation) { object.rotate(options.rotation.x, options.rotation.y, options.rotation.z); }

        if (options.culling !== undefined) { object.material.setCulling(options.culling); }
        if (options.opaque !== undefined) { object.material.setOpaque(options.opaque); }

        if (options.billboard) { object.isBillboard = options.billboard; }

        return object;
    }

    private static _centerObjectInGrid(object: Instance, options: PropOptions): Instance {
        // Center Object in grid
        let bbox = object.geometry.boundingBox;
        
        let x = -bbox[0],
            y = -bbox[1],
            z = -bbox[2];

        if (options.rotation && (options.rotation.y == PI_2 || options.rotation.y == PI3_2)) {
            x = -bbox[2];
            z = -bbox[0];
        }

        object.translate(x, y, z);

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

        this._centerObjectInGrid(object, options);

        return this._processObjectProperties(object, options);
    }

    public static createText(renderer: Renderer, options: PropOptions): Text {
        return new Text(renderer, options.text, options.font, {position: options.position, rotation: options.rotation, size: options.fontSize});
    }

    public static createFloor(renderer: Renderer, options: PropOptions): Instance {
        let geometry = new PlaneGeometry(renderer, options.size.x, options.size.y),
            texture = TexturesManager.getTexture(<TexturesNames>options.texture),
            material = this._createMaterial(renderer, texture, this._getUVS(texture, options.uv), options.repeat),
            
            object = new Instance(renderer, geometry, material);

        // Center Object in grid
        let bbox = geometry.boundingBox;
        object.translate(-bbox[0], -bbox[1], -bbox[2]);

        return this._processObjectProperties(object, options);
    }
    
    public static createWall(renderer: Renderer, options: PropOptions): Instance {
        let geometry = new WallGeometry(renderer, options.size.x, options.size.y),
            texture = TexturesManager.getTexture(<TexturesNames>options.texture),
            material = this._createMaterial(renderer, texture, this._getUVS(texture, options.uv), options.repeat),
            
            object = new Instance(renderer, geometry, material);

        this._centerObjectInGrid(object, options);

        return this._processObjectProperties(object, options);
    }

    public static createProp(renderer: Renderer, propName: string, options?: PropOptions): Instance {
        let name = <PropsNames>propName,
            obj: Instance;

        switch (name) {
            case 'Model3D':
                obj = PropsFactory.create3DModel(renderer, options);
                break;
                
            case 'Text':
                obj = PropsFactory.createText(renderer, options);
                break;
                
            case 'Floor':
                obj = PropsFactory.createFloor(renderer, options);
                break;
                
            case 'Wall':
                obj = PropsFactory.createWall(renderer, options);
                break;

            default:
                throw new Error("Prop [" + propName + "] not found!");
        }

        return obj;
    }
}

export default PropsFactory;