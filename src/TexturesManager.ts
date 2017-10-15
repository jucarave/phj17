import Renderer from './engine/Renderer';
import Texture from './engine/Texture';

interface TexturesMap {
    [index: string] : Texture
}

type TexturesNames = 'TEXTURE_16' | 'MOCKGUN' | 'PROPS' | 'CITY';

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

    public init(renderer: Renderer): void {
        this._textures['TEXTURE_16'] = new Texture("img/texture.png", renderer, () => { this._onTextureLoad(); });
        this._textures['CITY'] = new Texture("img/city.png", renderer, () => { this._onTextureLoad(); });
        
        this._textures['MOCKGUN'] = new Texture("img/mockGun.png", renderer, () => { this._onTextureLoad(); });

        this._textures['PROPS'] = new Texture("img/props.png", renderer, () => { this._onTextureLoad(); });

        this._texturesCount = 4;
    }

    public getTexture(textureName: TexturesNames): Texture {
        return this._textures[textureName];
    }

    public isReady(): boolean {
        return this._texturesReady == this._texturesCount;
    }
}

export default (new TexturesManager());