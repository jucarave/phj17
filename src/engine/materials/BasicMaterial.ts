import Material from './Material';
import Renderer from '../Renderer';
import Texture from '../Texture';
import Shader from '../shaders/Shader';

class BasicMaterial extends Material {
    private _texture         : Texture;

    constructor(texture: Texture, renderer: Renderer) {
        super(renderer, "BASIC");

        this._texture = texture;
    }

    public render(): void {
        if (Material.lastRendered == this) { return; }

        let gl = this._renderer.GL,
            shader = Shader.lastProgram;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture.texture);
        gl.uniform1i(shader.uniforms["uTexture"], 0);

        Material.lastRendered = this;
    }

    public get isReady(): boolean {
        return this._texture.isReady;
    }
}

export default BasicMaterial;