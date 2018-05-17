import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import Vector4 from '../math/Vector4';
import { degToRad } from '../Utils';
import Instance from './Instance';

class Camera extends Instance {
    private _up                  : Vector3;

    public screenSize            : Vector3;
    
    public readonly projection          : Matrix4;
    public readonly lookTo             : Vector3;

    constructor(projection: Matrix4) {
        super(null, null);

        this.projection = projection;
        this._transform = Matrix4.createIdentity();

        this.lookTo = new Vector3(0, 0, 0);
        this._up = new Vector3(0, 1, 0);
        this.screenSize = new Vector3(0.0);

        this.lookTo.onChange = () => this._onLookToChange();

        this._needsUpdate = true;
    }

    private _onLookToChange() {
        this.emmitNeedsUpdate();
    }

    public getTransformation(force: boolean = false): Matrix4 {
        if (!force && !this._needsUpdate && (this._parent === null || !this._parent.needsUpdate)) {
            return this._transform;
        }

        let f = this.forward,
            l = Vector3.cross(this._up, f).normalize(),
            u = Vector3.cross(f, l).normalize();

        let cp = this.globalPosition,
            x = -Vector3.dot(l, cp),
            y = -Vector3.dot(u, cp),
            z = -Vector3.dot(f, cp);

        this._transform.set(
            l.x, u.x, f.x, 0,
            l.y, u.y, f.y, 0,
            l.z, u.z, f.z, 0,
              x,   y,   z, 1
        );
        
        this._needsUpdate = false;

        return this._transform;
    }

    public get forward(): Vector3 {
        let cp = this.globalPosition,
            t = this.globalLookTo;

        return new Vector3(cp.x - t.x, cp.y - t.y, cp.z - t.z).normalize();
    }

    public get globalLookTo(): Vector3 {
        if (!this._parent) { return this.lookTo; }
        
        const t = this._parent.getTransformation();
        const p = t.multiplyVector(new Vector4(this.lookTo.x, this.lookTo.y, this.lookTo.z, 1));

        return p.xyz;
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