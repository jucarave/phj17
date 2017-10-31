import Texture from 'engine/Texture';
import Renderer from 'engine/Renderer';
import BasicMaterial from 'engine/materials/BasicMaterial';
import WallGeometry from 'engine/geometries/WallGeometry';
import { Vector3, vec3 } from 'engine/math/Vector3';
import { roundUpPowerOf2 } from 'engine/Utils';
import Instance from 'engine/entities/Instance';

export interface TextOptions {
    size?: number;
    stroke?: boolean;
    fill?: boolean;
    fillColor?: string;
    strokeColor?: string;
    position?: Vector3;
    rotation?: Vector3;
}

const OptionsDefault: TextOptions = {
    size: 12,
    stroke: false,
    fill: true,
    fillColor: '#FFFFFF',
    strokeColor: '#FFFFFF',
    position: vec3(0.0, 0.0, 0.0),
    rotation: vec3(0.0, 0.0, 0.0)
};

class Text extends Instance {
    private _text               : string;
    private _font               : string;
    private _options            : TextOptions;
    
    constructor(renderer: Renderer, text: string, font: string, options?: TextOptions) {
        super(renderer);

        this._text = text;
        this._font = font;
        this._options = this._mergeOptions(options);

        this._printText();
    }

    private _mergeOptions(options: TextOptions): TextOptions {
        if (!options) { return OptionsDefault; }

        if (!options.size) { options.size = OptionsDefault.size; }
        if (!options.stroke) { options.stroke = OptionsDefault.stroke; }
        if (!options.fill) { options.fill = OptionsDefault.fill; }
        if (!options.fillColor) { options.fillColor = OptionsDefault.fillColor; }
        if (!options.strokeColor) { options.strokeColor = OptionsDefault.strokeColor; }
        if (!options.position) { options.position = OptionsDefault.position; }
        if (!options.rotation) { options.rotation = OptionsDefault.rotation; }

        return options;
    }

    private _printText(): void {
        let canvas = document.createElement("canvas"),
            ctx = canvas.getContext("2d");

        ctx.font = this._options.size + "px " + this._font;
        
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.oImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        let size = ctx.measureText(this._text);

        canvas.width = roundUpPowerOf2(size.width);
        canvas.height = roundUpPowerOf2(this._options.size);
        ctx.font = this._options.size + "px " + this._font;

        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.oImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;

        if (this._options.fill) {
            ctx.fillStyle = this._options.fillColor;
            ctx.fillText(this._text, 4, this._options.size);
        }

        if (this._options.stroke) {
            ctx.strokeStyle = this._options.strokeColor;
            ctx.strokeText(this._text, 4, this._options.size);
        }

        let uvs = [0, 0, (size.width + 4) / canvas.width, (this._options.size + 8) / canvas.height],
            texture = new Texture(canvas, this._renderer),
            material = new BasicMaterial(this._renderer, texture),
            geometry = new WallGeometry(this._renderer, size.width / 100, this._options.size / 100);

        material.setUv(uvs[0], uvs[1], uvs[2], uvs[3]);
        material.setOpaque(false);

        this._material = material;        
        this._geometry = geometry;

        this.translate(this._options.position.x, this._options.position.y, this._options.position.z);
        this.rotate(this._options.rotation.x, this._options.rotation.y, this._options.rotation.z);
    }
}

export default Text;