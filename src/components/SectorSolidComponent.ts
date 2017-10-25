import Component from 'engine/Component';
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

    public awake() {
        this._scene = <DemoScene> this._instance.scene;
    }

    public update() {

    }

    public destroy() {

    }
}

export default SectorSolidComponent;