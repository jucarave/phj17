import Scene from 'engine/Scene';
import Renderer from 'engine/Renderer';
import Instance from 'engine/entities/Instance';
import { Vector3, vec3 } from 'engine/math/Vector3';
import { pixelCoordsToWorld as pctw } from 'engine/Utils';
import { rememberPoolAlloc as rpa, freePoolAlloc } from 'engine/Utils';
import EntityFactory from 'factories/EntityFactory';
import SectorsManager from 'managers/SectorsManager';
import App from 'App';
import HUDScene from 'scenes/HUDScene';
import Sector from 'scenes/Sector';
import PlayerComponent from 'components/PlayerComponent';

interface SectorTrigger {
    position: Vector3;
    size: Vector3;
    sector: Sector;
    destroy: boolean;
}

class DemoScene extends Scene {
    private _hud                : HUDScene;
    private _triggers           : Array<SectorTrigger>;
    private _player             : Instance;
    private _playerComponent    : PlayerComponent;
    private _sectors            : Array<Sector>;

    constructor(app: App, renderer: Renderer) {
        super(app, renderer);

        this._triggers = [];
        this._sectors = [];
        this._buildScene();
    }

    private _addTrigger(position: Vector3, size: Vector3, sector: Sector, destroy: boolean): void {
        this._triggers.push({
            position,
            size,
            sector,
            destroy
        });
    }

    private _addSectorInstances(sector: Sector): void {
        sector.build();
        let instances = sector.instances;

        for (let i=0,ins;ins=instances[i];i++) {
            this.addGameObject(ins);
        }
    }

    private _buildScene(): void {
        let camera = this._app.camera,
            player = EntityFactory.createPlayer(this._renderer, camera);

        // Sectors
        let sector = SectorsManager.getSector("ALLEY");
        this._sectors.push(sector);
        this._addSectorInstances(sector);
        this._addTrigger(new Vector3(0.0, 0.0, 1.5), new Vector3(9.0, 10.0, 4.5), sector, false); //Activate
        this._addTrigger(new Vector3(0.0, 0.0, 6.0), new Vector3(9.0, 10.0, 4.5), sector, true); //Deactivate

        this.addGameObject(EntityFactory.createAlleyGuy(this._renderer).translate(rpa(pctw(vec3(24, 0, 8)))));
        
        this.addGameObject(player.translate(rpa(pctw(vec3(112, 0.0, 24)))).rotate(0, Math.PI, 0));
        this.setCamera(camera);

        this._hud = new HUDScene(this._app, this._renderer);

        this._player = player;
        this._playerComponent = player.getComponent<PlayerComponent>(PlayerComponent.componentName);

        freePoolAlloc();
    }

    public update(): void {
        super.update();

        if (!this._playerComponent.moved) { return; }

        let p = this._player.position;
        for (let i=0,trig;trig=this._triggers[i];i++) {
            let tp = trig.position,
                ts = trig.size;

            if (p.x < tp.x || p.x >= tp.x+ts.x || p.y < tp.y || p.y >= tp.y+ts.y || p.z < tp.z || p.z >= tp.z+ts.z) {
                continue;
            }

            if (trig.destroy) {
                trig.sector.destroy();
            } else {
                let ret = trig.sector.build();
                if (ret != null) {
                    this._addSectorInstances(trig.sector);
                }
            }

            break;
        }
    }

    public render(): void {
        super.render();

        this._hud.render();
    }

    public get player(): Instance {
        return this._player;
    }
}

export default DemoScene;