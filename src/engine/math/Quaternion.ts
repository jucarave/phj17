import Vector3 from './Vector3';
import Matrix4 from './Matrix4';

class Quaternion {
    private _s              : number;
    private _axis           : Vector3;

    constructor(scalar: number = 1, axis: Vector3 = new Vector3(0, 0, 0)) {
        this._s = scalar;
        this._axis = axis;
    }

    public sum(q: Quaternion): Quaternion {
        this._s += q.s;
        this._axis.sum(q.axis);

        return this;
    }

    public multiplyScalar(s: number): Quaternion {
        this._s *= s;
        this._axis.multiply(s);

        return this;
    }

    public multiplyQuaternion(q: Quaternion): Quaternion {
        const sA = this.s,
            sB = q.s,
            
            axisB = q.axis.clone(),
            
            cross = Vector3.cross(this.axis, q.axis);

        this._s = sA * sB - Vector3.dot(this._axis, axisB);

        this._axis.multiply(sB).sum(axisB.multiply(sA)).sum(cross);

        return this;
    }

    public normalize(): Quaternion {
        const norm = this.norm;
        if (norm != 0) {
            this.multiplyScalar(1 / this.norm);
        }

        return this;
    }

    public toUnitNormQuaternion(): Quaternion {
        const angle = this._s * 0.5;
        
        this._axis.normalize();

        this._s = Math.cos(angle);
        this._axis.multiply(Math.sin(angle));

        return this;
    }

    public getRotationMatrix(): Matrix4 {
        const ret = Matrix4.createIdentity(),
        
            qx = this._axis.x,
            qy = this._axis.y,
            qz = this._axis.z,
            qw = this._s,
            
            m11 = 1 - 2*qy*qy - 2*qz*qz,        m12 = 2*qx*qy - 2*qz*qw,        m13 = 2*qx*qz + 2*qy*qw,
            m21 = 2*qx*qy + 2*qz*qw,            m22 = 1 - 2*qx*qx - 2*qz*qz,    m23 = 2*qy*qz - 2*qx*qw,
            m31 = 2*qx*qz - 2*qy*qw,            m32 = 2*qy*qz + 2*qx*qw,        m33 = 1 - 2*qx*qx - 2*qy*qy;

        ret.set(
            m11, m12, m13, 0,
            m21, m22, m23, 0,
            m31, m32, m33, 0,
              0,   0,   0, 1
        );

        return ret;
    }

    public clone(): Quaternion {
        return new Quaternion(this._s, this._axis.clone());
    }

    public get norm(): number {
        const s2 = this._s * this._s,
            v2 = Vector3.dot(this._axis, this._axis);

        return Math.sqrt(s2 + v2);
    }

    public get conjugate(): Quaternion {
        return new Quaternion(this._s, this._axis.clone().multiply(-1));
    }

    public get inverse(): Quaternion {
        const norm = this.norm;
        return this.conjugate.multiplyScalar( 1 / (norm * norm));
    }

    public get s(): number { return this._s; }
    public get axis(): Vector3 { return this._axis; }
}

export default Quaternion;