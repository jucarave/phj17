import { Vector3 } from 'engine/math/Vector3';
import Config from 'engine/Config';
import Ellipsoid from 'engine/physics/Ellipsoid';

class BoundingBox {
    public x1          : number;
    public y1          : number;
    public z1          : number;
    public x2          : number;
    public y2          : number;
    public z2          : number;
    public position    : Vector3;

    constructor() {
        this.x1 = Infinity;
        this.y1 = Infinity;
        this.z1 = Infinity;
        this.x2 = -Infinity;
        this.y2 = -Infinity;
        this.z2 = -Infinity;
    }

    public overlaps(bbox: BoundingBox, ellipsoid: Ellipsoid): boolean {
        let x1 = (this.position.x + this.x1) / ellipsoid.size.x,
            y1 = (this.position.y + this.y1) / ellipsoid.size.y,
            z1 = (this.position.z + this.z1) / ellipsoid.size.z,
            x2 = (this.position.x + this.x2) / ellipsoid.size.x,
            y2 = (this.position.y + this.y2) / ellipsoid.size.y,
            z2 = (this.position.z + this.z2) / ellipsoid.size.z;

        let bx1 = bbox.position.x + bbox.x1,
            by1 = bbox.position.y + bbox.y1,
            bz1 = bbox.position.z + bbox.z1,
            bx2 = bbox.position.x + bbox.x2,
            by2 = bbox.position.y + bbox.y2,
            bz2 = bbox.position.z + bbox.z2;


        return !(x1 > bx2 || x2 < bx1 || 
            y1 > by2 || y2 < by1 || 
            z1 > bz2 || z2 < bz1
        );
    }

    public readjustSize(x: number, y: number, z: number): void {
        this.x1 = Math.min(this.x1, x);
        this.y1 = Math.min(this.y1, y);
        this.z1 = Math.min(this.z1, z);
        this.x2 = Math.max(this.x2, x);
        this.y2 = Math.max(this.y2, y);
        this.z2 = Math.max(this.z2, z);

        if (this.x1 == this.x2) {
            this.x1 -= Config.PIXEL_UNIT_RELATION;
            this.x2 += Config.PIXEL_UNIT_RELATION;
        }
        if (this.y1 == this.y2) {
            this.y1 -= Config.PIXEL_UNIT_RELATION;
            this.y2 += Config.PIXEL_UNIT_RELATION;
        }
        if (this.z1 == this.z2) {
            this.z1 -= Config.PIXEL_UNIT_RELATION;
            this.z2 += Config.PIXEL_UNIT_RELATION;
        }
    }
}

export const UnitBox: BoundingBox = new BoundingBox();

UnitBox.readjustSize(0.5, 0.5, 0.5);
UnitBox.readjustSize(-0.5, -0.5, -0.5);

export default BoundingBox;