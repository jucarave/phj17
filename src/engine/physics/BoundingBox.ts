import { Vector3 } from 'engine/math/Vector3';
import Body from 'engine/physics/Body';

class BoundingBox {
    private _body       : Body;

    public x1          : number;
    public y1          : number;
    public z1          : number;
    public x2          : number;
    public y2          : number;
    public z2          : number;

    constructor(body: Body) {
        this.x1 = Infinity;
        this.y1 = Infinity;
        this.z1 = Infinity;
        this.x2 = -Infinity;
        this.y2 = -Infinity;
        this.z2 = -Infinity;

        this._body = body;
    }

    public overlaps(bbox: BoundingBox) {
        let x1 = this.position.x + this.x1,
            y1 = this.position.y + this.y1,
            z1 = this.position.z + this.z1,
            x2 = this.position.x + this.x2,
            y2 = this.position.y + this.y2,
            z2 = this.position.z + this.z2;

        let bx1 = bbox.position.x + this.x1,
            by1 = bbox.position.y + this.y1,
            bz1 = bbox.position.z + this.z1,
            bx2 = bbox.position.x + this.x2,
            by2 = bbox.position.y + this.y2,
            bz2 = bbox.position.z + this.z2;


        return !(x1 > bx2 || x2 < bx1 || 
            y1 > by2 || y2 < by1 || 
            z1 > bz2 || z2 < bz1
        );
    }

    public get position(): Vector3 {
        return this._body.position;
    }
}

export default BoundingBox;