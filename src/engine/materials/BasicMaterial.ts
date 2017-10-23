import Material from 'engine/materials/Material';
import Renderer from 'engine/Renderer';
import Texture from 'engine/Texture';
import Shader from 'engine/shaders/Shader';

class BasicMaterial extends Material {
    private _texture         : Texture;
    private _uv              : Array<number>;
    private _repeat          : Array<number>;

    constructor(renderer: Renderer, texture: Texture) {
        super(renderer, "BASIC");

        this._texture = texture;
        this._uv = [0.0, 0.0, 1.0, 1.0];
        this._repeat = [1.0, 1.0];
    }

    public setUv(x: number, y: number, w: number, h: number): void {
        this._uv = [x, y, w, h];
    }
    
    public setRepeat(x: number, y: number): void {
        this._repeat = [x, y];
    }

    public render(): void {
        if (Material.lastRendered == this) { return; }

        let gl = this._renderer.GL,
            shader = Shader.lastProgram;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture.texture);
        gl.uniform1i(shader.uniforms["uTexture"], 0);

        gl.uniform4fv(shader.uniforms["uUV"], this._uv);
        gl.uniform2fv(shader.uniforms["uRepeat"], this._repeat);

        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
        }

        Material.lastRendered = this;
    }

    public get isReady(): boolean {
        return this._texture.isReady;
    }

    public get texture(): Texture {
        return this._texture;
    }
}

export default BasicMaterial;