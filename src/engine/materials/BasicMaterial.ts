import Material from '../materials/Material';
import Renderer from '../Renderer';
import Texture from '../Texture';
import BASIC from '../shaders/Basic';

class BasicMaterial extends Material {
    private _texture         : Texture;
    private _uv              : Array<number>;
    private _repeat          : Array<number>;

    constructor(texture: Texture) {
        super(BASIC);

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

    public render(renderer: Renderer): void {
        const gl = renderer.GL,
            shader = this.shader,
            program = shader.getProgram(renderer);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture.getTexture(renderer));
        gl.uniform1i(program.uniforms["uTexture"], 0);

        gl.uniform4fv(program.uniforms["uUV"], this._uv);
        gl.uniform2fv(program.uniforms["uRepeat"], this._repeat);

        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
        }
    }

    public get isReady(): boolean {
        return this._texture.isReady;
    }

    public get texture(): Texture {
        return this._texture;
    }
}

export default BasicMaterial;