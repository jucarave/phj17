import { createUUID } from './Utils';
import Shader from './shaders/Shader';

interface CachedGL {
    program             : WebGLProgram;
}

class Renderer {
    private _canvas              : HTMLCanvasElement;
    private _gl                  : WebGLRenderingContext;
    private _cache               : CachedGL;

    public readonly id           : string;
    
    constructor(width: number, height: number) {
        this.id = createUUID();
        
        this._createCanvas(width, height);
        this._initGL();

        this._cache = {
            program: null
        };
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

    public clear(): void {
        let gl = this._gl;

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    public switchProgram(program: WebGLProgram): boolean {
        if (this._cache.program === program) {
            return false;
        }

        this._cache.program = program;

        const gl = this._gl;
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