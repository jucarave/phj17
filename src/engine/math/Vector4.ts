import Vector3 from "./Vector3";

export default class Vector4 {
    private _x                  : number;
    private _y                  : number;
    private _z                  : number;
    private _w                  : number;
    private _onChange           : Function;

    constructor(x: number, y: number, z: number, w: number) {
        this.set(x, y, z, w);

        this._onChange = null;
    }

    public set(x: number, y: number, z: number, w: number): Vector4 {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;

        if (this._onChange) { this._onChange(); }

        return this;
    }

    public add(x: number, y: number, z: number, w: number): Vector4 {
        this._x += x;
        this._y += y;
        this._z += z;
        this._w += w;

        if (this._onChange) { this._onChange(); }

        return this;
    }

    public multiply(num: number): Vector4 {
        this._x *= num;
        this._y *= num;
        this._z *= num;
        this._w *= num;

        if (this._onChange) { this._onChange(); }

        return this;
    }

    public normalize(): Vector4 {
        let l = this.length;

        this.multiply(1 / l);

        return this;
    }
    
    public toArray(): Array<number> {
        return [this.x, this.y, this.z, this.w];
    }

    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get z(): number { return this._z; }
    public get w(): number { return this._w; }
    
    public set x(x: number) { 
        this._x = x; 
        if (this._onChange) { this._onChange(); }
    }

    public set y(y: number) { 
        this._y = y;
        if (this._onChange) { this._onChange(); }
    }

    public set z(z: number) { 
        this._z = z;
        if (this._onChange) { this._onChange(); }
    }

    public set w(w: number) { 
        this._w = w;
        if (this._onChange) { this._onChange(); } 
    }

    public get xyz(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    public static dot(vectorA: Vector4, vectorB: Vector4): number {
        let ret = vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z + vectorA.w * vectorB.w;
        return ret;
    }

    public set onChange(onChange: Function) {
        if (this._onChange !== null) {
            console.warn("Vector3 already has a onChange Callback", this);
        }

        this._onChange = onChange;
    }
}