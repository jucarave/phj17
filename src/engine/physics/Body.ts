import Instance from 'engine/entities/Instance';
import Geometry from 'engine/geometries/Geometry';
import Triangle from 'engine/physics/Triangle'
import Physics from 'engine/physics/Physics'
import BoundingBox from 'engine/physics/BoundingBox'
import { UnitBox } from 'engine/physics/BoundingBox'
import { CollisionPackage } from 'engine/physics/Physics';
import List from 'engine/List';
import { Vector3 } from 'engine/math/Vector3';
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

        geometry.boundingBox.position = this.position;
        instance.body = this;
        Physics.addBody(this);
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
        UnitBox.position = collision.position; 
        if (!this._bbox.overlaps(UnitBox, collision.ellipsoid)) { return; }

        let position = collision.ellipsoid.coordinatesToESpace(this.position);

        this._triangles.each((triangle: Triangle) => {
            triangle.translateToSpace(collision.ellipsoid, position);

            if (!triangle.isFrontFacing(collision.normalizedVelocity)) {
                return triangle.clearTriangle();
            }

            let t0: number, 
                t1: number, 
                embeddedInPlane = false,
                
                signedDistance = triangle.signedDistanceTo(collision.position),
                
                normalDotVelocity = Vector3.dot(triangle.normal, collision.velocity);

            // Sphere travelling parallel to plane
            if (normalDotVelocity == 0.0) {
                // No collision
                if (Math.abs(signedDistance) >= 1.0) { return triangle.clearTriangle(); }

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
                    return triangle.clearTriangle();
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

                    collisionPoint = new Vector3(intersectionPoint);
                }

                intersectionPoint.delete();
                collisionDistance.delete();
            }

            if (!foundCollision) {
                let velocitySquaredVel = collision.velocity.squaredLength,
                    a: number, b: number, c: number, newT: number;

                a = velocitySquaredVel;

                // Collision against vertices
                for (let i=0;i<3;i++) {
                    let p = triangle.getPoint(i),
                        base_p = Vector3.difference(collision.position, p),
                        p_base = Vector3.difference(p, collision.position);

                    b = 2.0 * (Vector3.dot(collision.velocity, base_p));
                    c = p_base.squaredLength - 1.0;
                    
                    newT = getLowestRoot(a, b, c, t);
                    if (newT !== null) {
                        t = newT;
                        foundCollision = true;

                        collisionPoint = new Vector3(p);
                    }

                    p_base.delete();
                    base_p.delete();
                }

                // Collision against edges
                for (let i=0;i<3;i++) {
                    let edge = triangle.getEdge(i),
                        p_base = Vector3.difference(triangle.getPoint(i), collision.position),
                        edgeSquaredLength = edge.squaredLength,
                        edgeDotVelocity = Vector3.dot(edge, collision.velocity),
                        edgeDotPBase = Vector3.dot(edge, p_base);

                    a = edgeSquaredLength * -velocitySquaredVel + edgeDotVelocity * edgeDotVelocity;
                    b = edgeSquaredLength * (2 * Vector3.dot(collision.velocity, p_base)) - 2.0 * edgeDotVelocity * edgeDotPBase;
                    c = edgeSquaredLength * (1 - p_base.squaredLength) + edgeDotPBase * edgeDotPBase;

                    newT = getLowestRoot(a, b, c, t);
                    if (newT !== null) {
                        let f = (edgeDotVelocity * newT - edgeDotPBase) / edgeSquaredLength;
                        if (f >= 0.0 && f <= 1.0) {
                            t = newT;
                            foundCollision = true;
                            
                            let point = edge.clone().multiply(f).add(triangle.getPoint(i));

                            collisionPoint = new Vector3(point);

                            point.delete();
                        }
                    }

                    p_base.delete();
                }
            }

            if (foundCollision) {
                let distToCollision = t * collision.velocity.length;

                if (collision.foundCollision == false || distToCollision < collision.nearestDistance) {
                    collision.nearestDistance = distToCollision;
                    collision.intersectionPoint = collisionPoint;
                    collision.foundCollision = true;
                }
            }

            triangle.clearTriangle();
        });

        position.delete();
    }

    public get instance(): Instance { return this._instance; }
    public get boundingBox(): BoundingBox { return this._bbox; }
}

export default Body;