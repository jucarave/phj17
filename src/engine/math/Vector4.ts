import Vector3 from "./Vector3";

export default class Vector4 {
    private _x                  : number;
    private _y                  : number;
    private _z                  : number;
    private _w                  : number;
    private _onChange           : Array<Function>;

    public static UP           = new Vector4(0, 1, 0, 0);
    public static LEFT         = new Vector4(0, 0, -1, 0);
    public static FORWARD      = new Vector4(1, 0, 0, 0);

    constructor(x: number, y: number, z: number, w: number) {
        this._onChange = [];
        
        this.set(x, y, z, w);
    }

    private _callOnChange(): void {
        for (let i=0,onChange;onChange=this._onChange[i];i++) {
            onChange();
        }
    }

    public set(x: number, y: number, z: number, w: number): Vector4 {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;

        this._callOnChange();

        return this;
    }

    public add(x: number, y: number, z: number, w: number): Vector4 {
        this._x += x;
        this._y += y;
        this._z += z;
        this._w += w;

        this._callOnChange();

        return this;
    }

    public multiply(num: number): Vector4 {
        this._x *= num;
        this._y *= num;
        this._z *= num;
        this._w *= num;

        this._callOnChange();

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
        this._callOnChange();
    }

    public set y(y: number) { 
        this._y = y;
        this._callOnChange();
    }

    public set z(z: number) { 
        this._z = z;
        this._callOnChange();
    }

    public set w(w: number) { 
        this._w = w;
        this._callOnChange(); 
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
        this._onChange.push(onChange);
    }
}