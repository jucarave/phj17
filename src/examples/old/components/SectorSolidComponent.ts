import { Component } from '../../../engine';

import Sector from 'scenes/Sector';
import DemoScene from 'scenes/DemoScene';

class SectorSolidComponent extends Component {
    private _sectors            : Array<Sector>;
    private _scene              : DemoScene;

    public static readonly componentName = "SectorSolidComponent";

    constructor() {
        super(SectorSolidComponent.componentName);

        this._sectors = [];
    }

    private _updateCollisions(): void {
        for (let i=0,sector;sector=this._sectors[i];i++) {
            sector.clearCollision(this._instance.collision);
        }

        let sectors = this._scene.getIntersectingSectors(this._instance);
        this._sectors = sectors;

        for (let i=0,sector;sector=sectors[i];i++) {
            sector.registerCollision(this._instance.collision);
        }
    }

    public awake(): void {
        this._scene = <DemoScene> this._instance.scene;

        this._updateCollisions();
    }

    public update(): void {

    }

    public destroy(): void {

    }
}

export default SectorSolidComponent;