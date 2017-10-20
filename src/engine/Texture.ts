import Renderer from 'engine/Renderer';

class Texture {
    private _src               : string;
    private _img               : HTMLImageElement;
    private _canvas            : HTMLCanvasElement;
    private _renderer          : Renderer;
    private _ready             : boolean;

    public readonly texture    : WebGLTexture;

    constructor(src: string|HTMLCanvasElement, renderer: Renderer, callback?: Function) {
        
        this._renderer = renderer;
        this.texture = renderer.GL.createTexture();
        this._ready = false;
        
        if ((<HTMLCanvasElement>src).getContext) {
            this._canvas = <HTMLCanvasElement>src;
            this._img = null;
            this._src = null;

            this._onReady();
        } else {
            this._canvas = null;
            this._src = <string>src;

            this._img = new Image();
            this._img.src = this._src;
            this._img.onload = () => {
                this._onReady();
    
                if (callback) {
                    callback(this);
                }
            };
        }
    }

    private _onReady(): void {
        let gl = this._renderer.GL;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, (this._canvas)? this._canvas : this._img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this._ready = true;
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