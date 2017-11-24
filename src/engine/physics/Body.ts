import Instance from 'engine/entities/Instance';
import Geometry from 'engine/geometries/Geometry';
import Triangle from 'engine/physics/Triangle'
import BoundingBox from 'engine/physics/BoundingBox'
import List from 'engine/List';
import { Vector3 } from 'engine/math/Vector3';

class Body {
    private _instance       : Instance;
    private _geometry       : Geometry;
    private _triangles      : List<Triangle>;
    private _bbox           : BoundingBox;
    
    public position         : Vector3;

    constructor(instance: Instance, geometry: Geometry) {
        this._instance = instance;
        this._geometry = geometry;
        
        this.position = instance.position;
        this._triangles = this._geometry.triangles;
        this._bbox = this._geometry.boundingBox;

        geometry.boundingBox.body = this;
        instance.body = this;
    }

    private _readjustBBox(triangle: Triangle): void {
        this._bbox.x1 = Math.min(this._bbox.x1, triangle.p1.x, triangle.p2.x, triangle.p3.x);
        this._bbox.y1 = Math.min(this._bbox.y1, triangle.p1.y, triangle.p2.y, triangle.p3.y);
        this._bbox.z1 = Math.min(this._bbox.z1, triangle.p1.z, triangle.p2.z, triangle.p3.z);

        this._bbox.x2 = Math.max(this._bbox.x2, triangle.p1.x, triangle.p2.x, triangle.p3.x);
        this._bbox.y2 = Math.max(this._bbox.y2, triangle.p1.y, triangle.p2.y, triangle.p3.y);
        this._bbox.z2 = Math.max(this._bbox.z2, triangle.p1.z, triangle.p2.z, triangle.p3.z);
    }

    public addTriangle(triangle: Triangle): void {
        this._triangles.push(triangle);

        this._readjustBBox(triangle);
    }

    public collidesWithSphere(sphere: Body): boolean {
        if (!this._bbox.overlaps(sphere.boundingBox)) { return false; }

        return false;
    }

    public get instance(): Instance { return this._instance; }
    public get boundingBox(): BoundingBox { return this._bbox; }
}

export default Body;