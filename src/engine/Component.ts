import Instance from './entities/Instance';

abstract class Component {
    protected _instance           : Instance;

    public addInstance(instance: Instance): void {
        this._instance = instance;
    }

    public abstract awake(): void;
    public abstract update(): void;
    public abstract destroy(): void;
}

export default Component;