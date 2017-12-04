import Poolify from 'engine/Poolify';
import { PoolClass } from 'engine/Poolify';

export class Vector3 implements PoolClass {
    private _x                  : number;
    private _y                  : number;
    private _z                  : number;
    private _length             : number;
    private needsUpdate         : boolean;

    public inUse                : boolean;

    constructor(x: number|Vector3 = 0, y: number = 0, z: number = 0) {
        this.set(x, y, z);
    }

    public clear(): Vector3 {
        this.set(0, 0, 0);

        return this;
    }

    public set(x: number|Vector3, y?: number, z?: number): Vector3 {
        if ((<Vector3>x).x !== undefined) {
            let v = <Vector3>x;
            x = v.x;
            y = v.y;
            z = v.z;
        } else {
            x = <number>x;
        }

        this._x = x;
        this._y = y;
        this._z = z;

        this.needsUpdate = true;

        return this;
    }

    public add(x: number|Vector3, y?: number, z?: number): Vector3 {
        let isVector = (<Vector3>x).x !== undefined;
        if (isVector) {
            x = <Vector3>x;

            this._x += x.x;
            this._y += x.y;
            this._z += x.z;
        } else {
            x = <number>x;
            this._x += x;
            
            if (y !== undefined) {
                this._y += y;
                this._z += z;
            } else {
                this._y += x;
                this._z += x;
            }
        }

        this.needsUpdate = true;

        return this;
    }

    public multiply(num: number): Vector3 {
        this._x *= num;
        this._y *= num;
        this._z *= num;

        this.needsUpdate = true;

        return this;
    }

    public normalize(): Vector3 {
        let l = this.length;

        this.multiply(1 / l);

        return this;
    }

    public clone(): Vector3 {
        return vec3(this.x, this.y, this.z);
    }

    public delete(): void {
        pool.free(this);
    }

    public equals(vector3: Vector3): boolean {
        return (this.x == vector3.x && this.y == vector3.y && this.z == vector3.z);
    }

    public get x(): number { return this._x; }
    public get y(): number { return this._y; }
    public get z(): number { return this._z; }

    public set x(x: number) { this._x = x; this.needsUpdate = true; }
    public set y(y: number) { this._y = y; this.needsUpdate = true; }
    public set z(z: number) { this._z = z; this.needsUpdate = true; }

    public get length(): number {
        if (!this.needsUpdate) {
            return this._length;
        }

        this._length = Math.sqrt(this.squaredLength);
        this.needsUpdate =  false;

        return this._length;
    }

    public set length(length: number) {
        let f = length / this._length;

        this.multiply(f);
    }

    public get squaredLength(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public static cross(vectorA: Vector3, vectorB: Vector3): Vector3 {
        return vec3(
            vectorA.y * vectorB.z - vectorA.z * vectorB.y,
            vectorA.z * vectorB.x - vectorA.x * vectorB.z,
            vectorA.x * vectorB.y - vectorA.y * vectorB.x
        );
    }

    public static dot(vectorA: Vector3, vectorB: Vector3): number {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
    }

    public static difference(vectorA: Vector3, vectorB: Vector3): Vector3 {
        return vec3(
            vectorA.x - vectorB.x,
            vectorA.y - vectorB.y,
            vectorA.z - vectorB.z
        );
    }
}

const pool = new Poolify(40, Vector3);
export function vec3(x: number = 0, y?: number, z?: number): Vector3 {
    if (y === undefined && z === undefined) { z = x; }
    else if (z === undefined){ z = 0; }
    if (y === undefined){ y = x; }

    let obj = <Vector3>(pool.allocate());
    return obj.set(x, y, z);
}

(<any>window).Vector3 = pool;