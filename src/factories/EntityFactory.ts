import Instance from 'engine/entities/Instance';
import PlayerComponent from 'components/PlayerComponent';
import CharaComponent from 'components/CharaComponent';
import CharaRendererComponent from 'components/CharaRendererComponent';
import Renderer from 'engine/Renderer';
import Camera from 'engine/Camera';
import WallGeometry from 'engine/geometries/WallGeometry';
import BasicMaterial from 'engine/materials/BasicMaterial';
import TextureManager from 'managers/TexturesManager';
import UVManager from 'managers/UVManager';
import { pixelCoordsToWorld as pctw, rememberPoolAlloc as rpa, freePoolAlloc } from 'engine/Utils';
import { Vector3, vec3 } from 'engine/math/Vector3';

export type EntitiesNames = 'ALLEY_GUY';

abstract class EntityFactory {
    public static createPlayer(renderer: Renderer, camera: Camera): Instance {
        let ret: Instance = Instance.allocate(renderer),
            playerComponent = new PlayerComponent(),
            charaComponent = new CharaComponent();;

        charaComponent.setEllipsoid(new Vector3(0.3, 1.3, 0.3), new Vector3(0.0, 1.3 / 2, 0.0));
        
        playerComponent.setCamera(camera);

        ret.addComponent(charaComponent);
        ret.addComponent(playerComponent);

        return ret;
    }

    public static createAlleyGuy(renderer: Renderer): Instance {
        let size = rpa(pctw(vec3(12, 26))),
            geometry = new WallGeometry(renderer, size.x, size.y),
            texture = TextureManager.getTexture("NPCS"),
            material = new BasicMaterial(renderer, texture),
            uv = UVManager.NPCS.ALLEY_PERSON,
            ret = Instance.allocate(renderer, geometry, material);

        geometry.offset.set(0, size.y / 2, 0);

        
        ret.addComponent(new CharaComponent());
        ret.addComponent(new CharaRendererComponent(uv));
        ret.isBillboard = true;
        
        material.setOpaque(false);

        freePoolAlloc();

        return ret;
    }

    public static createInstance(renderer: Renderer, name: EntitiesNames, position: Vector3): Instance {
        let ins: Instance;

        switch (name) {
            case 'ALLEY_GUY':
                ins = this.createAlleyGuy(renderer);
                break;
        }

        ins.position.add(position.x, position.y, position.z);

        return ins;
    }
}

export default EntityFactory;