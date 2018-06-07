import { Renderer, Texture } from '../../../engine';

interface TexturesMap {
    [index: string] : Texture
}

export type TexturesNames = 'TEXTURE_16' | 'MOCKGUN' | 'CITY' | 'NPCS';

class TexturesManager {
    private _textures           : TexturesMap;
    private _texturesCount      : number;
    private _texturesReady      : number;

    constructor() {
        this._textures = {};
        this._texturesCount = 0;
        this._texturesReady = 0;
    }

    private _onTextureLoad() {
        this._texturesReady += 1;
    }

    private _loadTexture(renderer: Renderer, code: TexturesNames, url: string): void {
        this._texturesCount += 1;
        
        this._textures[code] = new Texture(url, renderer, () => { this._onTextureLoad(); });
    }

    public init(renderer: Renderer): void {
        this._loadTexture(renderer, 'TEXTURE_16', "img/texture.png");
        this._loadTexture(renderer, 'CITY', "img/city.png");
        this._loadTexture(renderer, 'NPCS', "img/npcs.png");

        this._loadTexture(renderer, 'MOCKGUN', "img/mockGun.png");
    }

    public getTexture(textureName: TexturesNames): Texture {
        return this._textures[textureName];
    }

    public isReady(): boolean {
        return this._texturesReady == this._texturesCount;
    }
}

export default (new TexturesManager());