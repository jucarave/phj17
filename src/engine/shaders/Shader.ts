import { ShaderStruct } from 'engine/shaders/ShaderStruct';
import { createUUID } from 'engine/Utils';

interface Attributes {
    [index: string]: number
};

interface Uniforms {
    [index: string]: WebGLUniformLocation
}

class Shader {
    public attributes               : Attributes;
    public uniforms                 : Uniforms;
    public program                  : WebGLProgram;
    public attributesCount          : number;

    public readonly uuid            : string;

    static maxAttribLength          : number;
    static lastProgram              : Shader;

    constructor(private gl: WebGLRenderingContext, shader: ShaderStruct) {
        this.attributes = {};
        this.uniforms = {};

        this.uuid = createUUID();

        this.compileShaders(shader);
        this.getShaderAttributes(shader);
        this.getShaderUniforms(shader);
    }

    private compileShaders(shader: ShaderStruct): void {
        let gl: WebGLRenderingContext = this.gl;

        let vShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vShader, shader.vertexShader);
        gl.compileShader(vShader);

        let fShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fShader, shader.fragmentShader);
        gl.compileShader(fShader);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vShader);
        gl.attachShader(this.program, fShader);
        gl.linkProgram(this.program);

        if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vShader));
            throw new Error("Error compiling vertex shader");
        }

        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fShader));
            throw new Error("Error compiling fragment shader");
        }

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(this.program));
            throw new Error("Error linking the program");
        }
    }

    private getShaderAttributes(shader: ShaderStruct): void {
        let code: Array<string> = shader.vertexShader.split(/\n/g);
        let gl: WebGLRenderingContext = this.gl;

        let attribute: string;
        let location: number;

        this.attributesCount = 0;

        for (let i = 0, len = code.length; i < len; i++) {
            let c: Array<string> = code[i].trim().split(/ /g);

            if (c[0] == 'attribute') {
                attribute = c.pop().replace(/;/g, "");
                location = gl.getAttribLocation(this.program, attribute);

                gl.enableVertexAttribArray(location);

                this.attributes[attribute] = location;
                this.attributesCount += 1;
            }
        }

        Shader.maxAttribLength = Math.max(Shader.maxAttribLength, this.attributesCount);
    }

    private getShaderUniforms(shader: ShaderStruct): void {
        let code: Array<string> = shader.vertexShader.split(/\n/g);
        code = code.concat(shader.fragmentShader.split(/\n/g));

        let gl: WebGLRenderingContext = this.gl;

        let uniform: string;
        let location: WebGLUniformLocation;
        let usedUniforms: Array<string> = [];

        for (let i = 0, len = code.length; i < len; i++) {
            let c: Array<string> = code[i].trim().split(/ /g);

            if (c[0] == "uniform") {
                uniform = c.pop().replace(/;/g, "");
                if (usedUniforms.indexOf(uniform) != -1) { continue; }

                location = gl.getUniformLocation(this.program, uniform);

                usedUniforms.push(uniform);

                this.uniforms[uniform] = location;
            }
        }
    }

    public useProgram(): void {
        if (Shader.lastProgram == this) { return; }

        let gl: WebGLRenderingContext = this.gl;

        gl.useProgram(this.program);
        Shader.lastProgram = this;

        let attribLength: number = this.attributesCount;
        for (var i = 0, len = Shader.maxAttribLength; i < len; i++) {
            if (i < attribLength) {
                gl.enableVertexAttribArray(i);
            } else {
                gl.disableVertexAttribArray(i);
            }
        }
    }
}

Shader.maxAttribLength = 0;
Shader.lastProgram = null;

export default Shader;