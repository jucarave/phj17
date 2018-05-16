import Shader from './shaders/Shader';
import Basic from './shaders/Basic';
import Color from './shaders/Color';
import { ShaderMap, ShadersNames } from './shaders/ShaderStruct';
import { createUUID } from './Utils';

class Renderer {
    private _canvas              : HTMLCanvasElement;
    private _gl                  : WebGLRenderingContext;
    private _shaders             : ShaderMap;

    public readonly id           : string;
    
    constructor(width: number, height: number) {
        this.id = createUUID();
        
        this._createCanvas(width, height);
        this._initGL();
        this._initShaders();
    }

    private _createCanvas(width: number, height: number): void {
        let canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        this._canvas = canvas;
    }

    private _initGL(): void {
        let gl = this._canvas.getContext("webgl");

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.BLEND);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);

        this._gl = gl;
    }

    private _initShaders(): void {
        this._shaders = {};

        this._shaders.BASIC = new Shader(this._gl, Basic);
        this._shaders.COLOR = new Shader(this._gl, Color);

        this._shaders.BASIC.useProgram();
    }

    public clear(): void {
        let gl = this._gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    public switchShader(shaderName: ShadersNames): void {
        this._shaders[shaderName].useProgram();
    }

    public getShader(shaderName: ShadersNames): Shader {
        return this._shaders[shaderName];
    }

    public get GL(): WebGLRenderingContext {
        return this._gl;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public get width(): number {
        return this._canvas.width;
    }

    public get height(): number {
        return this._canvas.height;
    }
}

export default Renderer;