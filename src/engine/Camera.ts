import Matrix4 from 'engine/math/Matrix4';
import { Vector3, vec3 } from 'engine/math/Vector3';

class Camera {
    private _transform           : Matrix4;
    private _target              : Vector3;
    private _up                  : Vector3;
    private _angle               : Vector3;
    private _needsUpdate         : boolean;

    public position              : Vector3;
    public screenSize            : Vector3;

    public readonly projection          : Matrix4;

    constructor(projection: Matrix4) {
        this.projection = projection;
        this._transform = Matrix4.createIdentity();

        this.position = vec3(0, 0, 0);
        this._target = vec3(0, 0, 0);
        this._up = vec3(0, 1, 0);
        this._angle = vec3(0.0);
        this.screenSize = vec3(0.0);

        this._needsUpdate = true;
    }

    public setPosition(x: number, y: number, z: number): Camera {
        this.position.set(x, y, z);

        this._needsUpdate = true;

        return this;
    }

    public setTarget(x: number, y: number, z: number): Camera {
        this._target.set(x, y, z);

        this._needsUpdate = true;

        return this;
    }

    public setAngle(x: number, y: number, z: number): Camera {
        this._angle.set(x, y, z);

        this._needsUpdate = true;

        return this;
    }

    public getAngle(): Vector3 {
        return this._angle;
    }

    public getTransformation(): Matrix4 {
        if (!this._needsUpdate) {
            return this._transform;
        }

        let f = this.forward,
            l = Vector3.cross(this._up, f).normalize(),
            u = Vector3.cross(f, l).normalize();

        let cp = this.position,
            x = -Vector3.dot(l, cp),
            y = -Vector3.dot(u, cp),
            z = -Vector3.dot(f, cp);

        Matrix4.set(
            this._transform,
            l.x, u.x, f.x, 0,
            l.y, u.y, f.y, 0,
            l.z, u.z, f.z, 0,
              x,   y,   z, 1
        );
        
        this._needsUpdate = false;

        f.delete();
        l.delete();
        u.delete();

        return this._transform;
    }

    public get forward(): Vector3 {
        let cp = this.position,
            t = this._target;

        return vec3(cp.x - t.x, cp.y - t.y, cp.z - t.z).normalize();
    }

    public get isUpdated(): boolean {
        return !this._needsUpdate;
    }

    public static createPerspective(fov: number, ratio: number, znear: number, zfar: number): Camera {
        return new Camera(Matrix4.createPerspective(fov, ratio, znear, zfar));
    }

    public static createOrthographic(width: number, height: number, znear: number, zfar: number): Camera {
        let ret = new Camera(Matrix4.createOrtho(width, height, znear, zfar));
        ret.screenSize.set(width, height, 0);

        return ret;
    }
}

export default Camera;