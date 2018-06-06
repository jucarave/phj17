import Vector3 from '../math/Vector3';

class DirectionalLight {
    public ambientIntensity         : number;
    public diffuseIntensity         : number;

    public readonly color           : Vector3;
    public readonly direction       : Vector3;

    constructor() {
        this.ambientIntensity = 0.2;
        this.diffuseIntensity = 0.8;
        
        this.color = new Vector3(1.0, 1.0, 1.0);
        this.direction = new Vector3(0.0, -1.0, 0.0);
    }
}

export default DirectionalLight;