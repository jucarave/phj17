import { PI_2, PI3_2 } from 'engine/Constants';
import Renderer from 'engine/Renderer';
import { pixelCoordsToWorld as pctw } from 'engine/Utils';
import BoxCollision from 'engine/collisions/BoxCollision';
import { vec3 } from 'engine/math/Vector3';
import Sector from 'scenes/Sector';
import { PropOptions } from 'factories/PropsFactory';
import UVManager from 'managers/UVManager';

interface SectorsMap {
    [index: string]: Sector;
}

export type SectorNames = 'ALLEY';

class SectorsManager {
    private _sectors            : SectorsMap;

    constructor() {
        this._sectors = {};
    }

    private _buildAlley(renderer: Renderer): void {
        let sector = new Sector(renderer, vec3(0.0, 0.0, 0.0), vec3(3.0, 8.0, 9.0)),
            sectorName: SectorNames = 'ALLEY',
            city = UVManager.CITY;

        sector.addProp("Floor", <PropOptions>{ texture: 'CITY', position: pctw(0.0, 0.0, 0.0), size: pctw(144, 48), uv: city.ALLEY_FLOOR, repeat: [9, 3]});
        
        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(0.0, 0.0, 0.0), size: pctw(144, 128), uv: city.BLACK_BUILDING, repeat: [9, 8]});
        
        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(0.0, 0.0, 0.0), rotation: vec3(0, PI_2, 0), size: pctw(48, 36), uv: city.ALLEY_BACK_WALL, repeat: [3, 1] });
        
        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(0.0, 0.0, 48), size: pctw(32, 48), rotation: vec3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [2, 1] });
        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(64, 0.0, 48), size: pctw(16, 48), rotation: vec3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [1, 1] });
        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(96, 0.0, 48), size: pctw(16, 48), rotation: vec3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [1, 1] });
        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(128, 0.0, 48), size: pctw(16, 48), rotation: vec3(0, Math.PI, 0), uv: city.BAR_EXT_WALL, repeat: [1, 1] });

        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(128, 0.0, 0.0), rotation: vec3(0, PI3_2, 0), size: pctw(48, 32), uv: city.ALLEY_FENCE, repeat: [3, 1] });

        sector.addProp("Wall", <PropOptions>{ texture: 'CITY', position: pctw(24, 0.0, 40), size: pctw(10, 11), uv: city.BAR_FLOOR_SIGN, billboard: true });
        sector.addProp("Model3D", <PropOptions>{ model: 'Dumpster', texture: 'CITY', position: pctw(0.0, 0.0, 8.0), culling: true });
        sector.addProp("Model3D", <PropOptions>{ model: 'BarSign', texture: 'CITY', position: pctw(32, 26, 48), rotation: vec3(0, PI_2, 0), culling: true });
        sector.addProp("Model3D", <PropOptions>{ model: 'BarWindow', texture: 'CITY', position: pctw(80, 0.0, 48), rotation: vec3(0, PI_2, 0) });
        sector.addProp("Model3D", <PropOptions>{ model: 'BarWindow', texture: 'CITY', position: pctw(112, 0.0, 48), rotation: vec3(0, PI_2, 0) });
        sector.addProp("Model3D", <PropOptions>{ model: 'BarDoorFrame', texture: 'CITY', position: pctw(32, 0.0, 48), rotation: vec3(0, PI_2, 0) });
        sector.addProp("Model3D", <PropOptions>{ model: 'BarDoor', texture: 'CITY', position: pctw(41, 0.0, 48), rotation: vec3(0, PI_2, 0), opaque: false });
        sector.addProp("Model3D", <PropOptions>{ model: 'Barrel', texture: 'CITY', position: pctw(66, 0.0, 2) });
        sector.addProp("Model3D", <PropOptions>{ model: 'Barrel', texture: 'CITY', position: pctw(80, 0.0, 2), rotation: vec3(0, -PI_2, 0) });

        sector.addProp("Text", <PropOptions>{ text: "Jucarave", font: "retganon", fontSize: 36, position: pctw(48, 24, 24), rotation: vec3(0, PI_2, 0), opaque: false });
        sector.addProp("Text", <PropOptions>{ text: "A Game By", font: "retganon", fontSize: 36, position: pctw(80, 16, 24), rotation: vec3(0, PI_2, 0), opaque: false });

        // Collisions
        sector.registerCollision((new BoxCollision(pctw(0, 0, -1), pctw(144, 128, 2))).centerInAxis(false, false, false)); // RightWall
        sector.registerCollision((new BoxCollision(pctw(-1, 0, 0), pctw(2, 36, 48))).centerInAxis(false, false, false)); // BackWall
        sector.registerCollision((new BoxCollision(pctw(0, 0, 47), pctw(41, 48, 2))).centerInAxis(false, false, false)); // Bar part 1
        sector.registerCollision((new BoxCollision(pctw(55, 0, 47), pctw(89, 48, 2))).centerInAxis(false, false, false)); // Bar part 2
        sector.registerCollision((new BoxCollision(pctw(127, 0, 0), pctw(2, 32, 48))).centerInAxis(false, false, false)); // Fence

        sector.registerCollision((new BoxCollision(pctw(0, 0, 8), pctw(16, 16, 30))).centerInAxis(false, false, false)); // Dumpster
        sector.registerCollision((new BoxCollision(pctw(22, 0, 36), pctw(12, 12, 12))).centerInAxis(false, false, false)); // Sign
        sector.registerCollision((new BoxCollision(pctw(66, 0, 0), pctw(27, 16, 16))).centerInAxis(false, false, false)); // Barrels

        sector.setCollision(pctw(0, 0, 0), pctw(144, 128, 48));

        this._sectors[sectorName] = sector;
    }

    public init(renderer: Renderer): void {
        this._buildAlley(renderer);
    }

    public getSector(sectorName: SectorNames): Sector {
        return this._sectors[sectorName];
    }
}

export default (new SectorsManager());