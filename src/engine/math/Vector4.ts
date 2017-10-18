export class Vector4 {
    private _x                  : number;
    private _y                  : number;
    private _z                  : number;
    private _w                  : number;
    private _length             : number;
    private needsUpdate         : boolean;

    constructor(x: number, y: number, z: number, w: number) {
        this.set(x, y, z, w);
    }

    public set(x: number, y: number, z: number, w: number): Vector4 {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;

        this.needsUpdate = true;

        return this;
    }

    public add(x: number, y: number, z: number, w: number): Vector4 {
        this._x += x;
        this._y += y;
        this._z += z;
        this._w += w;

        this.needsUpdate = true;

        return this;
    }

    public multiply(num: number): Vector4 {
        this._x *= num;
        this._y *= num;
        this._z *= num;
        this._w *= num;

        this.needsUpdate = true;

        return this;
    }

    public normalize(): Vector4 {
        let l = this.length;

        this.multiply(1 / l);

        return this;
    }

    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get z(): number { return this._z; }
    public get w(): number { return this._w; }

    public get length(): number {
        if (!this.needsUpdate) {
            return this._length;
        }

        this._length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        this.needsUpdate =  false;

        return this._length;
    }

    public static dot(vectorA: Vector4, vectorB: Vector4): number {
        let ret = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z + vectorA.w * vectorB.w;
        return ret;
    }
}

export function vec4(x: number = 0, y?: number, z?: number, w?: number): Vector4 {
    if (y === undefined && z === undefined) { z = x; w = x; }
    else if (z === undefined){ z = 0; }
    if (y === undefined){ y = x; }
    if (w === undefined){ w = x; }

    return new Vector4(x, y, z, w);
}