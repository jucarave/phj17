import Vector3 from '../math/Vector3';

class DirectionalLight {
    public intensity                : number;

    public readonly color           : Vector3;
    public readonly direction       : Vector3;

    constructor() {
        this.intensity = 1.0;
        this.color = new Vector3(1.0, 1.0, 1.0);
        this.direction = new Vector3(0.0, -1.0, 0.0);
    }
}

export default DirectionalLight;