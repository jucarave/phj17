import { Vector3 } from 'engine/math/Vector3';
import { freePoolAlloc, rememberPoolAlloc as rpa } from 'engine/Utils';

const buffer = new ArrayBuffer(4),
    floatBuffer = new Float32Array(buffer),
    int32Buffer = new Uint32Array(buffer);

function bInt(floatNumber: number): number {
    floatBuffer[0] = floatNumber;
    return int32Buffer[0];
}

class Triangle {
    private _p1             : Vector3;
    private _p2             : Vector3;
    private _p3             : Vector3;
    private _normal         : Vector3;
    private _plane          : number;

    constructor(p1: Vector3, p2: Vector3, p3: Vector3) {
        this._p1 = p1;
        this._p2 = p2;
        this._p3 = p3;

        this._calculateNormal();
        this._calculatePlaneEquation();
    }

    private _calculateNormal(): void {
        let e1 = rpa(Vector3.difference(this._p2, this._p1)),
            e2 = rpa(Vector3.difference(this._p3, this._p1));

        this._normal = new Vector3(rpa(Vector3.cross(e1, e2).normalize()));

        freePoolAlloc();
    }

    private _calculatePlaneEquation(): void {
        let n = this._normal,
            p = this._p1;

        this._plane = -(n.x*p.x+n.y*p.y+n.z*p.z);
    }

    public isFrontFacing(direction: Vector3): boolean {
        return (Vector3.dot(this._normal, direction) <= 0);
    }

    public signedDistanceTo(point: Vector3): number {
        return Vector3.dot(point, this._normal) + this._plane;
    }

    public isPointInTriangle(point: Vector3): boolean {
        let v1 = rpa(Vector3.difference(this._p2, this._p1)),
            v2 = rpa(Vector3.difference(this._p3, this._p1)),
            vp = rpa(Vector3.difference(point, this._p1));

        let a = Vector3.dot(v1, v1),
            b = Vector3.dot(v1, v2),
            c = Vector3.dot(v2, v2),
            d = Vector3.dot(vp, v1),
            e = Vector3.dot(vp, v2),
            ac_bb=(a*c)-(b*b),
            x = (d*c)-(e*b),
            y = (e*a)-(d*b),
            z = x+y-ac_bb;

        freePoolAlloc();

        return (bInt(z)& ~(bInt(x)|bInt(y)) & 0x80000000) != 0;
    }

    public getPoint(index: number): Vector3 {
        if (index == 0) { return this._p1; } else 
        if (index == 1) { return this._p2; } else
        if (index == 2) { return this._p3; }
    }

    public get p1(): Vector3 { return this._p1; }
    public get p2(): Vector3 { return this._p2; }
    public get p3(): Vector3 { return this._p3; }
    public get normal(): Vector3 { return this._normal; }
}

export default Triangle;