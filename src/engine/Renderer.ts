import { createUUID } from './Utils';
import Shader from './shaders/Shader';
import Texture from './Texture';

interface TextureCache {
    [index: string]     : { id: string, position: number };
}

interface CachedGL {
    program             : WebGLProgram;
    materialId          : string;
    textures            : TextureCache;
    texturesCount       : number;
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
            program: null,
            materialId: null,
            textures: {},
            texturesCount: 0
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

        return true;
    }

    public switchMaterial(materialId: string): boolean {
        if (this._cache.materialId === materialId) {
            return false;
        }

        this._cache.materialId = materialId;
        return true;
    }

    public bindTexture(texture: Texture, type: string, uniform: WebGLUniformLocation): boolean {
        const gl = this._gl;

        if (this._cache.textures[type] != null) {
            if (this._cache.textures[type].id == texture.id) {
                return false;
            }

            this._cache.textures[type].id = texture.id;
        } else {
            this._cache.textures[type] = {
                id: texture.id,
                position: this._cache.texturesCount
            };

            this._cache.texturesCount++;

            gl.activeTexture(gl.TEXTURE0 + this._cache.textures[type].position);
        }

        gl.bindTexture(gl.TEXTURE_2D, texture.getTexture(this));
        gl.uniform1i(uniform, this._cache.textures[type].position);

        return true;
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