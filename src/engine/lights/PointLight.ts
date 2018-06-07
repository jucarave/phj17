import Vector3 from '../math/Vector3';
import Instance from '../entities/Instance';

class PointLight extends Instance {
    public ambientIntensity         : number;
    public diffuseIntensity         : number;

    public constantAttenuation      : number;
    public linearAttenuation        : number;
    public quadraticAttenuation     : number;

    public readonly color           : Vector3;

    constructor(color: Vector3 = new Vector3(1.0, 1.0, 1.0), ambientIntensity: number = 0.2, diffuseIntensity: number = 5.0, constantAttenuation: number = 1.0, linearAttenuation: number = 0.09, quadraticAttenuation: number = 0.032) {
        super(null, null);

        this.ambientIntensity = ambientIntensity;
        this.diffuseIntensity = diffuseIntensity;

        this.constantAttenuation = constantAttenuation;
        this.linearAttenuation = linearAttenuation;
        this.quadraticAttenuation = quadraticAttenuation;
        
        this.color = color;
    }
}

export default PointLight;