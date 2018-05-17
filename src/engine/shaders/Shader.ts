import { ShaderStruct } from '../shaders/ShaderStruct';
import { createUUID } from '../Utils';
import Renderer from '../Renderer';

interface Attributes {
    [index: string]: number
};

interface Uniforms {
    [index: string]: WebGLUniformLocation
}

interface ShaderMap {
    [index: string]: Shader
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

    public attributesCount          : number;

    public readonly id              : string;

    private static shadersMap       : ShaderMap = {};

    static maxAttribLength          : number;

    constructor(shader: ShaderStruct) {
        this.id = createUUID();

        this._shaderInfo = shader;

        this._programs = {};
    }

    private _createProgram(renderer: Renderer): void {
        this._programs[renderer.id] = {};
        this._compileShaders(renderer, this._shaderInfo);
        this._getShaderAttributes(renderer, this._shaderInfo);
        this._getShaderUniforms(renderer, this._shaderInfo);
    }

    private _compileShaders(renderer: Renderer, shader: ShaderStruct): void {
        const gl: WebGLRenderingContext = renderer.GL;

        const vShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, shader.vertexShader);
        gl.compileShader(vShader);

        const fShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, shader.fragmentShader);
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

                gl.enableVertexAttribArray(location);

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

        const attribLength: number = this.attributesCount;
        for (var i = 0, len = Shader.maxAttribLength; i < len; i++) {
            if (i < attribLength) {
                gl.enableVertexAttribArray(i);
            } else {
                gl.disableVertexAttribArray(i);
            }
        }
    }

    public getProgram(renderer: Renderer): Program {
        if (!this._programs[renderer.id]) {
            this._createProgram(renderer);
        }

        return this._programs[renderer.id];
    }

    public static getShader(shader: ShaderStruct): Shader {
        if (Shader.shadersMap[shader.id]) {
            return Shader.shadersMap[shader.id];
        }

        const ret: Shader = new Shader(shader);
        Shader.shadersMap[shader.id] = ret;

        return ret;
    }
}

Shader.maxAttribLength = 0;

export default Shader;