import Renderer from '../Renderer';
import { ShadersNames } from '../shaders/ShaderStruct';
import Shader from '../shaders/Shader';
import { createUUID } from '../Utils';

abstract class Material {
    protected _renderer                : Renderer;
    protected _isOpaque                : boolean;
    protected _renderBothFaces         : boolean;
    
    public readonly shaderName        : ShadersNames;
    public readonly uuid              : string;

    public static lastRendered        : Material = null;

    constructor(renderer: Renderer, shaderName: ShadersNames) {
        this._renderer = renderer;
        this.shaderName = shaderName;
        this.uuid = createUUID();
        this._isOpaque = true;
        this._renderBothFaces = false;
    }

    public getShader(): Shader {
        return this._renderer.getShader(this.shaderName);
    }

    public abstract render(): void;
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