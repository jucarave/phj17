import Sector from '../engine/Sector';
import Renderer from '../engine/Renderer';
import { vec3 } from '../math/Vector3';

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
            sectorName: SectorNames = 'ALLEY';

        sector.addProp("BarFloorSign", vec3(2.0, 0.0, 1.0));
        sector.addProp("Dumpster", vec3(0.5, 0.0, 0.0));
        sector.addProp("BarSign", vec3(3.0, 1.7, 1.2), vec3(0, Math.PI/2, 0));
        sector.addProp("Text", vec3(5.0, 1.0, 0.0), vec3(0, Math.PI/2, 0), {text: "A Game By", font: 'retganon', size: 36});
        sector.addProp("Text", vec3(3.0, 1.5, 0.0), vec3(0, Math.PI/2, 0), {text: "Jucarave", font: 'retganon', size: 36});

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