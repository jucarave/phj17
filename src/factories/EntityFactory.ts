import Instance from 'engine/entities/Instance';
import PlayerComponent from 'components/PlayerComponent';
import CharaComponent from 'components/CharaComponent';
import CharaRendererComponent from 'components/CharaRendererComponent';
import SectorSolidComponent from 'components/SectorSolidComponent';
import Renderer from 'engine/Renderer';
import Camera from 'engine/Camera';
import WallGeometry from 'engine/geometries/WallGeometry';
import BasicMaterial from 'engine/materials/BasicMaterial';
import TextureManager from 'managers/TexturesManager';
import UVManager from 'managers/UVManager';
import { pixelCoordsToWorld as pctw } from 'engine/Utils';
import { Vector3 } from 'engine/math/Vector3';
import BoxCollision from 'engine/collisions/BoxCollision';

export type EntitiesNames = 'ALLEY_GUY';

abstract class EntityFactory {
    public static createPlayer(renderer: Renderer, camera: Camera): Instance {
        let ret: Instance = new Instance(renderer),
        playerComponent = new PlayerComponent();

        playerComponent.setCamera(camera);

        ret.addComponent(new CharaComponent());
        ret.addComponent(playerComponent);

        return ret;
    }

    public static createAlleyGuy(renderer: Renderer): Instance {
        let size = pctw(12, 26),
            geometry = new WallGeometry(renderer, size.x, size.y),
            texture = TextureManager.getTexture("NPCS"),
            material = new BasicMaterial(renderer, texture),
            uv = UVManager.NPCS.ALLEY_PERSON,
            ret = new Instance(renderer, geometry, material),
            collisionSize = pctw(8, 23, 8),
            bc = (new BoxCollision(ret.position, collisionSize)).centerInAxis(true, false, true);

        geometry.offset.set(0, size.y / 2, 0);

        bc.isDynamic = true;
        
        ret.addComponent(new CharaComponent());
        ret.addComponent(new CharaRendererComponent(uv));
        ret.addComponent(new SectorSolidComponent());
        ret.setCollision(bc)
        ret.isBillboard = true;
        
        material.setOpaque(false);

        size.delete();
        collisionSize.delete();

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