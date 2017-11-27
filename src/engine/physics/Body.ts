import Instance from 'engine/entities/Instance';
import Geometry from 'engine/geometries/Geometry';
import Triangle from 'engine/physics/Triangle'
import BoundingBox from 'engine/physics/BoundingBox'
import { UnityBox } from 'engine/physics/BoundingBox'
import { CollisionPackage } from 'engine/physics/Physics';
import List from 'engine/List';
import { Vector3, vec3 } from 'engine/math/Vector3';
import { clamp, getLowestRoot } from 'engine/Utils';

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

    public checkCollision(collision: CollisionPackage): void {
        if (!this._bbox.overlaps(UnityBox)) { return; }

        this._triangles.each((triangle: Triangle) => {
            if (!triangle.isFrontFacing(collision.normalizedVelocity)) {
                return;
            }

            let t0: number, 
                t1: number, 
                embeddedInPlane = false,
                
                signedDistance = triangle.signedDistanceTo(collision.position),
                
                normalDotVelocity = Vector3.dot(triangle.normal, collision.velocity);

            // Sphere travelling parallel to plane
            if (normalDotVelocity == 0.0) {
                // No collision
                if (Math.abs(signedDistance) >= 1.0) { return; }

                embeddedInPlane = true;
                t0 = 0;
                t1 = 1;
            } else {
                t0 = (-1.0 - signedDistance) / normalDotVelocity;
                t1 = ( 1.0 - signedDistance) / normalDotVelocity;

                if (t0 > t1) {
                    let h = t0;
                    t0 = t1;
                    t1 = h; 
                }

                // No collision
                if (t0 > 1.0 || t1 < 0.0) {
                    return;
                }

                t0 = clamp(t0, 0.0, 1.0);
                t1 = clamp(t1, 0.0, 1.0);
            }

            let collisionPoint: Vector3,
                foundCollision = false,
                t = 1.0;

            if (!embeddedInPlane) {
                let collisionDistance = collision.velocity.clone().multiply(t0),
                    intersectionPoint = Vector3.difference(collision.position, triangle.normal).add(collisionDistance);

                if (triangle.isPointInTriangle(intersectionPoint)) {
                    foundCollision = true;
                    t = t0;
                    collisionPoint = intersectionPoint;
                } else {
                    intersectionPoint.delete();
                }

                collisionDistance.delete();
            }

            if (!foundCollision) {
                let squaredVel = collision.velocity.squaredLength,
                    a: number, b: number, c: number, newT: number;

                a = squaredVel;

                // Collision against vertices
                for (let i=0;i<3;i++) {
                    let p = triangle.getPoint(i),
                        len = Vector3.difference(p, collision.position);

                    b = 2.0 * (Vector3.dot(collision.velocity, p));
                    c = len.squaredLength - 1.0;
                    
                    newT = getLowestRoot(a, b, c, t);
                    if (newT != null) {
                        t = newT;
                        foundCollision = true;
                        collisionPoint = p;
                    }

                    len.delete();
                }
            }
        });
    }

    public get instance(): Instance { return this._instance; }
    public get boundingBox(): BoundingBox { return this._bbox; }
}

export default Body;