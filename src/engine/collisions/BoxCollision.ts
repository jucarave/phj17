import Collision from './Collision';
import ColorMaterial from '../materials/ColorMaterial';
import CubeGeometry from '../geometries/CubeGeometry';
import Renderer from '../Renderer';
import { Vector3 } from '../math/Vector3';
import { Vector4 } from '../math/Vector4';
import Instance from '../entities/Instance';

class BoxCollision extends Collision {
    private _size                   : Vector3;
    private _box                    : Array<number>;

    public isDynamic                : boolean;
    

    constructor(position: Vector3, size: Vector3) {
        super(null);

        this._position = position;
        this._size = size;
        this.isDynamic = false;

        this._recalc();
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

    private _recalc(): void {
        let position = this._position,
            size = this._size;

        let px = position.x + this._offset.x,
            py = position.y + this._offset.y,
            pz = position.z + this._offset.z,
            
            sx = size.x / 2,
            sy = size.y / 2,
            sz = size.z / 2;

        this._box = this._reorderBox([px - sx, py - sy, pz - sz, px + sx, py + sy, pz + sz]);
    }

    public test(position: Vector3, direction: Vector3): Vector3 {
        if (this.isDynamic) {
            this._recalc();
        }

        let collided = false,
            width = 0.3,
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
            collided = true;
        }

        x += xTo;
        
        sign = (direction.z > 0)? 1 : -1;
        box = this._reorderBox([x - width, y, z - width * sign, x + width, y + height, z + width * sign + direction.z]);
        if (this._boxCollision(box)) {
            zTo = 0;
            collided = true;
        }

        if (!collided) {
            return null;
        }

        if (this.solid) {
            direction.set(xTo, 0, zTo);
        }

        return direction;
    }

    public addCollisionInstance(renderer: Renderer): void {
        let geometry = new CubeGeometry(renderer, this._size.x, this._size.y, this._size.z),
            material = new ColorMaterial(renderer, new Vector4(0.0, 1.0, 0.0, 0.5)),
            
            object = Instance.allocate(renderer, geometry, material);

        material.setOpaque(false);

        object.position = this._position;

        geometry.offset = this._offset;

        this._scene.addGameObject(object);

        this._displayInstance = object;
    }

    public centerInAxis(x: boolean, y: boolean, z: boolean): BoxCollision {
        this._offset.x = (!x)? this._size.x / 2 : 0;
        this._offset.y = (!y)? this._size.y / 2 : 0;
        this._offset.z = (!z)? this._size.z / 2 : 0;

        this._recalc();
        
        return this;
    }
}

export default BoxCollision;