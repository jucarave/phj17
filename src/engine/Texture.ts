import Renderer from './Renderer';
import Vector4 from './math/Vector4';

interface RendererTextureMap {
    [index: string]             : WebGLTexture;
}

class Texture {
    private _src               : string;
    private _img               : HTMLImageElement;
    private _canvas            : HTMLCanvasElement;
    private _ready             : boolean;
    private _textureMap        : RendererTextureMap;

    constructor(src: string|HTMLCanvasElement, callback?: Function) {
        this._textureMap = {};
        this._ready = false;
        
        if ((<HTMLCanvasElement>src).getContext) {
            this._canvas = <HTMLCanvasElement>src;
            this._img = null;
            this._src = null;

            this._ready = true;
        } else {
            this._canvas = null;
            this._src = <string>src;

            this._img = new Image();
            this._img.src = this._src;
            this._img.onload = () => {
                this._ready = true;
    
                if (callback) {
                    callback(this);
                }
            };
        }
    }

    private _parseTexture(renderer: Renderer): void {
        const gl = renderer.GL;

        if (!this._textureMap[renderer.id]) {
            this._textureMap[renderer.id] = gl.createTexture();
        }

        const texture = this._textureMap[renderer.id];

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, (this._canvas)? this._canvas : this._img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    public getUVS(x: number|Vector4, y?: number, w?: number, h?: number): Vector4 {
        let _x: number;

        if ((<Vector4>x).length !== undefined) {
            _x = (<Vector4>x).x;
            y = (<Vector4>x).y;
            w = (<Vector4>x).z;
            h = (<Vector4>x).w;
        }

        return new Vector4(
            _x / this.width,
            y / this.height,
            w / this.width,
            h / this.height
        );
    }

    public getTexture(renderer: Renderer): WebGLTexture {
        if (!this._textureMap[renderer.id]) {
            this._parseTexture(renderer);
        }

        return this._textureMap[renderer.id];
    }

    public get isReady(): boolean {
        return this._ready;
    }

    public get width(): number {
        return (this._canvas)? this._canvas.width : this._img.width;
    }

    public get height(): number {
        return (this._canvas)? this._canvas.height : this._img.height;
    }
}

export default Texture;