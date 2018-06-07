import { Instance, Renderer, Camera, WallGeometry, BasicMaterial, Vector3, vec3, BoxCollision, pixelCoordsToWorld as pctw, rememberPoolAlloc as rpa, freePoolAlloc } from '../../../engine';

import PlayerComponent from 'components/PlayerComponent';
import CharaComponent from 'components/CharaComponent';
import CharaRendererComponent from 'components/CharaRendererComponent';
import SectorSolidComponent from 'components/SectorSolidComponent';
import TextureManager from 'managers/TexturesManager';
import UVManager from 'managers/UVManager';

export type EntitiesNames = 'ALLEY_GUY';

abstract class EntityFactory {
    public static createPlayer(renderer: Renderer, camera: Camera): Instance {
        let ret: Instance = Instance.allocate(renderer),
        playerComponent = new PlayerComponent();

        playerComponent.setCamera(camera);

        ret.addComponent(new CharaComponent());
        ret.addComponent(playerComponent);

        return ret;
    }

    public static createAlleyGuy(renderer: Renderer): Instance {
        let size = rpa(pctw(vec3(12, 26))),
            geometry = new WallGeometry(renderer, size.x, size.y),
            texture = TextureManager.getTexture("NPCS"),
            material = new BasicMaterial(renderer, texture),
            uv = UVManager.NPCS.ALLEY_PERSON,
            ret = Instance.allocate(renderer, geometry, material),
            collisionSize = rpa(pctw(vec3(8, 23, 8))),
            bc = (new BoxCollision(ret.position, collisionSize)).centerInAxis(true, false, true);

        geometry.offset.set(0, size.y / 2, 0);

        bc.isDynamic = true;
        
        ret.addComponent(new CharaComponent());
        ret.addComponent(new CharaRendererComponent(uv));
        ret.addComponent(new SectorSolidComponent());
        ret.setCollision(bc)
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