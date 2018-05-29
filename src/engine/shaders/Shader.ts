import { ShaderStruct } from '../shaders/ShaderStruct';
import { createUUID } from '../Utils';
import Renderer from '../Renderer';

interface Attributes {
    [index: string]: number
};

interface Uniforms {
    [index: string]: WebGLUniformLocation
}

interface Program {
    program?                 : WebGLProgram;
    uniforms?                : Uniforms;
    attributes?              : Attributes;
}

interface RendererProgramsMap {
    [index: string]: Program
}

class Shader {
    private _shaderInfo              : ShaderStruct;
    private _programs                : RendererProgramsMap;

    public attributesCount           : number;
    public includes                  : Array<string>;

    public readonly id               : string;

    public static maxAttribLength          : number;

    constructor(shader: ShaderStruct) {
        this.id = createUUID();

        this.includes = [];
        this._shaderInfo = shader;

        this._programs = {};
    }

    private _createProgram(renderer: Renderer): void {
        this._programs[renderer.id] = {};
        this._compileShaders(renderer, this._shaderInfo);
        this._getShaderAttributes(renderer, this._shaderInfo);
        this._getShaderUniforms(renderer, this._shaderInfo);
    }

    private _getSourceWithIncludes(shader: string): string {
        let ret = shader;

        for (let i=0,inc;inc=this.includes[i];i++) {
            ret = "#define " + inc + "\n" + ret;
        }

        return ret;
    }

    private _compileShaders(renderer: Renderer, shader: ShaderStruct): void {
        const gl: WebGLRenderingContext = renderer.GL;

        const vShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, this._getSourceWithIncludes(shader.vertexShader));
        gl.compileShader(vShader);

        const fShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, this._getSourceWithIncludes(shader.fragmentShader));
        gl.compileShader(fShader);

        const program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vShader));
            throw new Error("Error compiling vertex shader");
        }

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fShader));
            throw new Error("Error compiling fragment shader");
        }

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program));
            throw new Error("Error linking the program");
        }

        this._programs[renderer.id].program = program;
    }

    private _getShaderAttributes(renderer: Renderer, shader: ShaderStruct): void {
        const code: Array<string> = shader.vertexShader.split(/\n/g),
            gl: WebGLRenderingContext = renderer.GL,
            program = this._programs[renderer.id].program;

        let attribute: string;
        let location: number;

        this.attributesCount = 0;

        let attributes: Attributes = {};

        for (let i = 0, len = code.length; i < len; i++) {
            const c: Array<string> = code[i].trim().split(/ /g);

            if (c[0] == 'attribute') {
                attribute = c.pop().replace(/;/g, "");
                location = gl.getAttribLocation(program, attribute);

                attributes[attribute] = location;
                this.attributesCount += 1;
            }
        }

        this._programs[renderer.id].attributes = attributes;

        Shader.maxAttribLength = Math.max(Shader.maxAttribLength, this.attributesCount);
    }

    private _getShaderUniforms(renderer: Renderer, shader: ShaderStruct): void {
        let code: Array<string> = shader.vertexShader.split(/\n/g);
        code = code.concat(shader.fragmentShader.split(/\n/g));

        const gl: WebGLRenderingContext = renderer.GL,
            program = this._programs[renderer.id].program;

        let uniform: string;
        let location: WebGLUniformLocation;
        let usedUniforms: Array<string> = [];

        let uniforms: Uniforms = {};

        for (let i = 0, len = code.length; i < len; i++) {
            const c: Array<string> = code[i].trim().split(/ /g);

            if (c[0] == "uniform") {
                uniform = c.pop().replace(/;/g, "");
                if (usedUniforms.indexOf(uniform) != -1) { continue; }

                location = gl.getUniformLocation(program, uniform);

                usedUniforms.push(uniform);

                uniforms[uniform] = location;
            }
        }

        this._programs[renderer.id].uniforms = uniforms;
    }

    public useProgram(renderer: Renderer): void {
        if (!this._programs[renderer.id]) {
            this._createProgram(renderer);
        }

        const gl: WebGLRenderingContext = renderer.GL,
            program = this._programs[renderer.id].program;

        gl.useProgram(program);

        const attribLength: number = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0, len = Shader.maxAttribLength; i < len; i++) {
            if (i < attribLength) {
                gl.enableVertexAttribArray(i);
            } else {
                gl.disableVertexAttribArray(i);
            }
        }
    }

    public deleteProgram(renderer: Renderer): Shader {
        if (!this._programs[renderer.id]) { return this; }

        const gl = renderer.GL,
            program = this._programs[renderer.id];

        gl.deleteProgram(program.program);

        this._programs[renderer.id] = null;

        return this;
    }

    public getProgram(renderer: Renderer): Program {
        if (!this._programs[renderer.id]) {
            this._createProgram(renderer);
        }

        return this._programs[renderer.id];
    }
}

Shader.maxAttribLength = 0;

export default Shader;