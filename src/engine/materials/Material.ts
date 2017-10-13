import Renderer from '../Renderer';
import { ShadersNames } from '../shaders/ShaderStruct';
import Shader from '../shaders/Shader';
import { createUUID } from '../../Utils';

abstract class Material {
    protected _renderer                : Renderer;
    
    public readonly shaderName        : ShadersNames;
    public readonly uuid              : string;

    public static lastRendered        : Material = null;

    constructor(renderer: Renderer, shaderName: ShadersNames) {
        this._renderer = renderer;
        this.shaderName = shaderName;
        this.uuid = createUUID();
    }

    public getShader(): Shader {
        return this._renderer.getShader(this.shaderName);
    }

    public abstract render(): void;
    public abstract get isReady(): boolean;
}

export default Material;