import Instance from 'engine/entities/Instance';

abstract class Component {
    protected _instance                 : Instance;
    
    public readonly name                    : string;
    public static readonly componentName    : string;

    constructor(componentName: string) {
        this.name = componentName;
    }

    public addInstance(instance: Instance): void {
        this._instance = instance;
    }

    public abstract awake(): void;
    public abstract update(): void;
    public abstract destroy(): void;
}

export default Component;