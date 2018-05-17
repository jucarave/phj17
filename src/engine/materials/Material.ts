import { ShaderStruct } from '../shaders/ShaderStruct';
import { createUUID } from '../Utils';
import Renderer from '../Renderer';
import Shader from '../shaders/Shader';

abstract class Material {
    protected _isOpaque                : boolean;
    protected _renderBothFaces         : boolean;
    
    public readonly shader             : Shader;
    public readonly id                 : string;

    constructor(shader: ShaderStruct) {
        this.shader = Shader.getShader(shader);
        this.id = createUUID();
        this._isOpaque = true;
        this._renderBothFaces = false;
    }

    public abstract render(renderer: Renderer): void;
    public abstract get isReady(): boolean;

    public get isOpaque(): boolean {
        return this._isOpaque;
    }

    public setOpaque(opaque: boolean): Material {
        this._isOpaque = opaque;
        return this;
    }

    public setCulling(bothFaces: boolean): Material {
        this._renderBothFaces = bothFaces;
        return this;
    }
}

export default Material;