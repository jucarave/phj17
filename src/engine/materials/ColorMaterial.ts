import Material from '../materials/Material';
import Vector4 from '../math/Vector4';
import Renderer from '../Renderer';
import COLOR from '../shaders/Color';

class ColorMaterial extends Material {
    private _color              : Array<number>;

    constructor(color: Vector4) {
        super(COLOR);

        this._color = color.toArray();
    }

    public render(renderer: Renderer): void {
        let gl = renderer.GL,
            shader = this.shader,
            program = shader.getProgram(renderer);

        gl.uniform4fv(program.uniforms["uColor"], this._color);

        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
        }
    }

    public get isReady(): boolean {
        return true;
    }
}

export default ColorMaterial;