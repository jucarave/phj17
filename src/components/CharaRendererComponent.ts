import Component from 'engine/Component';
import BasicMaterial from 'engine/materials/BasicMaterial';
import Instance from 'engine/entities/Instance';
import { get2DAngle, degToRad } from 'engine/Utils';
import { CHARA_UVS} from 'managers/UVManager';
import DemoScene from 'scenes/DemoScene';

class CharaRendererComponent extends Component {
    private _uvs                : CHARA_UVS;
    private _material           : BasicMaterial;
    private _scene              : DemoScene;
    private _player             : Instance;

    public static readonly componentName = "CharaRendererComponent";

    constructor(uv: CHARA_UVS) {
        super(CharaRendererComponent.componentName);

        this._uvs = uv;
    }

    public awake(): void {
        this._material = <BasicMaterial>this._instance.material;

        let uv = this._material.texture.getUVS(this._uvs.FRONT);
        this._material.setUv(uv.x, uv.y, uv.z, uv.w);

        this._scene = <DemoScene>this._instance.scene;
        this._player = this._scene.player;
    }

    public update(): void {
        let ang = get2DAngle(this._instance.position, this._player.position),
            uv;

        if (ang >= degToRad(45) && ang < degToRad(135)) {
            uv = this._material.texture.getUVS(this._uvs.LEFT);
        } else if (ang >= degToRad(135) && ang < degToRad(225)) {
            uv = this._material.texture.getUVS(this._uvs.BACK);
        } else if (ang >= degToRad(225) && ang < degToRad(315)) {
            uv = this._material.texture.getUVS(this._uvs.RIGHT);
        } else {
            uv = this._material.texture.getUVS(this._uvs.FRONT);
        }

        this._material.setUv(uv.x, uv.y, uv.z, uv.w);
    }

    public destroy(): void {

    }
}

export default CharaRendererComponent;