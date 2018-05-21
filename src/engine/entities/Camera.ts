import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import Vector4 from '../math/Vector4';
import { degToRad } from '../Utils';
import Instance from './Instance';

class Camera extends Instance {
    private _viewMatrix          : Matrix4;

    public screenSize            : Vector3;
    
    public readonly projection          : Matrix4;

    constructor(projection: Matrix4) {
        super(null, null);

        this.projection = projection;
        this._viewMatrix = Matrix4.createIdentity();

        this.screenSize = new Vector3(0.0);

        this._needsUpdate = true;
    }

    public getViewMatrix(): Matrix4 {
        const transform = this.getTransformation();

        const f = transform.multiplyVector(Vector4.FORWARD).xyz,
            l = transform.multiplyVector(Vector4.LEFT).xyz,
            u = transform.multiplyVector(Vector4.UP).xyz;

        let cp = this.globalPosition,
            x = Vector3.dot(l, cp),
            y = Vector3.dot(u, cp),
            z = Vector3.dot(f, cp);

        this._viewMatrix.set(
            l.x, u.x, f.x, 0,
            l.y, u.y, f.y, 0,
            l.z, u.z, f.z, 0,
              x,   y,   z, 1
        );

        return this._viewMatrix;
    }

    public static createPerspective(fovDegrees: number, ratio: number, znear: number, zfar: number): Camera {
        const fov = degToRad(fovDegrees);
        return new Camera(Matrix4.createPerspective(fov, ratio, znear, zfar));
    }

    public static createOrthographic(width: number, height: number, znear: number, zfar: number): Camera {
        let ret = new Camera(Matrix4.createOrtho(width, height, znear, zfar));
        ret.screenSize.set(width, height, 0);

        return ret;
    }
}

export default Camera;