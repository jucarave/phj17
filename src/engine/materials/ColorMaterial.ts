import Material from '../materials/Material';
import Vector4 from '../math/Vector4';
import Renderer from '../Renderer';
import Shader from '../shaders/Shader';

class ColorMaterial extends Material {
    private _color              : Array<number>;

    constructor(color: Vector4) {
        super("COLOR");

        this._color = color.toArray();
    }

    public render(renderer: Renderer): void {
        if (Material.lastRendered == this) { return; }

        let gl = renderer.GL,
            shader = Shader.lastProgram;

        gl.uniform4fv(shader.uniforms["uColor"], this._color);

        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
        }

        Material.lastRendered = this;
    }

    public get isReady(): boolean {
        return true;
    }
}

export default ColorMaterial;