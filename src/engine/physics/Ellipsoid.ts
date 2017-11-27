import { Vector3, vec3 } from 'engine/math/Vector3';

class Ellipsoid {
    private _position               : Vector3;
    private _size                   : Vector3;

    constructor(position: Vector3, size: Vector3) {
        this._position = position;
        this._size = size;
    }

    public coordinatesToESpace(vector: Vector3): Vector3 {
        return vec3(vector.x / this._size.x, vector.y / this._size.y, vector.z / this._size.z);
    }
    
    public coordinatesToR3(vector: Vector3): Vector3 {
        return vec3(vector.x * this._size.x, vector.y * this._size.y, vector.z * this._size.z);
    }

    public get size(): Vector3 {
        return this._size;
    }

    public get position(): Vector3 {
        return this._position;
    }
}

export default Ellipsoid;