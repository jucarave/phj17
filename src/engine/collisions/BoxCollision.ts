import Collision from 'engine/collisions/Collision';
import { Vector3 } from 'engine/math/Vector3';

class BoxCollision extends Collision {
    private _position               : Vector3;
    private _size                   : Vector3;
    private _box                    : Array<number>;

    constructor(position: Vector3, size: Vector3) {
        super(null);

        this._position = position;
        this._size = size;
        this._box = this._reorderBox([position.x, position.y, position.z, position.x + size.x, position.y + size.y, position.z + size.z]);
    }

    private _reorderBox(box: Array<number>): Array<number> {
        for (let i=0;i<3;i++) {
            if (box[3+i] < box[0+i]) {
                let h = box[0+i];
                box[0+i] = box[3+i];
                box[3+i] = h;
            }
        }

        return box;
    }

    private _boxCollision(box: Array<number>): boolean {
        let b = this._box;

        if (box[0] >= b[3] || box[1] >= b[4] || box[2] >= b[5] || box[3] < b[0] || box[4] < b[1] || box[5] < b[2]) {
            return false;
        }

        return true;
    }

    public test(position: Vector3, direction: Vector3): Vector3 {
        let width = 0.3,
            height = 0.8,
            x = position.x,
            y = position.y,
            z = position.z,
            xTo = direction.x,
            zTo = direction.z,
            sign = (direction.x > 0)? 1 : -1,
            box = this._reorderBox([x - width * sign, y, z - width, x + width * sign + direction.x, y + height, z + width]);

        if (this._boxCollision(box)) {
            xTo = 0;
        }

        x += xTo;
        
        sign = (direction.z > 0)? 1 : -1;
        box = this._reorderBox([x - width, y, z - width * sign, x + width, y + height, z + width * sign + direction.z]);
        if (this._boxCollision(box)) {
            zTo = 0;
        }

        direction.set(xTo, 0, zTo);

        return direction;
    }
}

export default BoxCollision;