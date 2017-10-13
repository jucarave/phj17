import Shader from './shaders/Shader';
import Basic from './shaders/Basic';
import { ShaderMap, ShadersNames } from './shaders/ShaderStruct';

class Renderer {
    private _canvas              : HTMLCanvasElement;
    private _gl                  : WebGLRenderingContext;
    private _shaders             : ShaderMap;
    
    constructor(width: number, height: number, container: HTMLElement) {
        this._createCanvas(width, height, container);
        this._initGL();
        this._initShaders();
    }

    private _createCanvas(width: number, height: number, container: HTMLElement): void {
        let canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        if (container) {
            container.appendChild(canvas);
        }

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