import { PI_2 } from '../engine/Constants';
import Renderer from '../engine/Renderer';
import { vec3 } from '../engine/math/Vector3';
import Sector from '../scenes/Sector';

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

        /*sector.addProp("BarFloorSign", vec3(2.0, 0.0, 1.0));
        sector.addProp("Dumpster", vec3(0.5, 0.0, 0.0));
        sector.addProp("BarSign", vec3(3.0, 1.7, 1.2), vec3(0, Math.PI/2, 0));
        sector.addProp("BarDoorFrame", vec3(3.0, 0.0, 1.5), vec3(0, Math.PI/2, 0));
        sector.addProp("BarWindow", vec3(5.5, 0.0, 1.5), vec3(0, Math.PI/2, 0));
        sector.addProp("BarWindow", vec3(7.5, 0.0, 1.5), vec3(0, Math.PI/2, 0));
        sector.addProp("Text", vec3(5.0, 1.0, 0.0), vec3(0, Math.PI/2, 0), {text: "A Game By", font: 'retganon', size: 36});
        sector.addProp("Text", vec3(3.0, 1.5, 0.0), vec3(0, Math.PI/2, 0), {text: "Jucarave", font: 'retganon', size: 36});*/

        sector.addProp("Model3D", { model: 'Dumpster', texture: 'CITY', position: vec3(0.5, 0.0, 0.0), culling: true });
        sector.addProp("Model3D", { model: 'BarSign', texture: 'CITY', position: vec3(3.0, 1.7, 1.2), rotation: vec3(0, PI_2, 0), culling: true });
        sector.addProp("Model3D", { model: 'BarWindow', texture: 'CITY', position: vec3(5.5, 0.0, 1.5), rotation: vec3(0, PI_2, 0) });
        sector.addProp("Model3D", { model: 'BarWindow', texture: 'CITY', position: vec3(7.5, 0.0, 1.5), rotation: vec3(0, PI_2, 0) });
        sector.addProp("Model3D", { model: 'BarDoorFrame', texture: 'CITY', position: vec3(3.0, 0.0, 1.5), rotation: vec3(0, PI_2, 0) });
        sector.addProp("Model3D", { model: 'BarDoor', texture: 'CITY', position: vec3(2.5625, 0.0, 1.5625), rotation: vec3(0, PI_2, 0) });

        sector.addProp("Text", { text: "A Game By", font: "retganon", size: 36, position: vec3(5.0, 1.0, 0.0), rotation: vec3(0, PI_2, 0) });

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