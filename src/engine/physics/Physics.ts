import Body from 'engine/physics/Body';
import Triangle from 'engine/physics/Triangle';
import Ellipsoid from 'engine/physics/Ellipsoid';
import { Vector3 } from 'engine/math/Vector3';
import List from 'engine/List';
import { rememberPoolAlloc as rpa, freePoolAlloc} from 'engine/Utils';

export interface CollisionPackage {
    ellipsoid                   : Ellipsoid;

    position                    : Vector3;
    velocity                    : Vector3;
    normalizedVelocity          : Vector3;

    foundCollision              : boolean;
    nearestDistance             : number;
    intersectionPoint           : Vector3;
}

const closeDistance = 0.005;

class Physics {
    private _bodies         : List<Body>;
    private _recursion      : number;
    private _slidePlane     : Triangle;

    constructor() {
        this._bodies = new List();
        this._slidePlane = new Triangle();
    }

    public addBody(body: Body): void {
        this._bodies.push(body)
    }

    public removeBody(body: Body): void {
        this._bodies.remove(body);
    }

    private _checkCollision(collisionPack: CollisionPackage): void {
        this._bodies.each((body: Body) => {
            body.checkCollision(collisionPack);
        });
    }

    private collideWithWorld(ellipsoid: Ellipsoid, position: Vector3, velocity: Vector3): Vector3 {
        if (this._recursion > 5) {
            return velocity;
        }

        let collisionPack : CollisionPackage = {
            ellipsoid: ellipsoid,

            position: rpa(position.clone()),
            velocity: rpa(velocity.clone()),
            normalizedVelocity: rpa(velocity.clone().normalize()),
            
            foundCollision: false,
            intersectionPoint: null,
            nearestDistance: Infinity
        }

        this._checkCollision(collisionPack);

        if (!collisionPack.foundCollision) {
            return velocity;
        }

        let destination = position.clone().add(velocity),
            newPosition = position.clone();

        if (collisionPack.nearestDistance >= closeDistance) {
            let v = velocity.clone();
            v.length = collisionPack.nearestDistance - closeDistance;

            newPosition.set(collisionPack.position).add(v);

            collisionPack.intersectionPoint.add(v.normalize().multiply(-closeDistance)); 

            v.delete();
        }

        let slidingPlaneOrigin = collisionPack.intersectionPoint.clone(),
            slidingPlaneNormal = Vector3.difference(newPosition, collisionPack.intersectionPoint).normalize();

        this._slidePlane.p1 = slidingPlaneOrigin;
        this._slidePlane.normal = slidingPlaneNormal;
        this._slidePlane.calculatePlaneEquation();

        let newDestinationPoint = Vector3.difference(destination, slidingPlaneNormal.multiply(this._slidePlane.signedDistanceTo(destination))),
            newVelocity = Vector3.difference(newDestinationPoint, collisionPack.intersectionPoint);

        velocity.set(newVelocity);

        destination.delete();
        slidingPlaneNormal.delete();
        slidingPlaneOrigin.delete();
        newDestinationPoint.delete();
        newVelocity.delete();

        if (velocity.length < closeDistance) {
            newPosition.delete();
            return velocity;
        }

        this._recursion++;

        let ret = this.collideWithWorld(ellipsoid, newPosition, velocity);

        newPosition.delete();

        return ret;
    }

    public checkCollision(ellipsoid: Ellipsoid, velocity: Vector3): Vector3 {
        let ePosition = rpa(ellipsoid.coordinatesToESpace(rpa(ellipsoid.position))),
            eVelocity = rpa(ellipsoid.coordinatesToESpace(velocity));

        this._recursion = 0;

        let ret = rpa(this.collideWithWorld(ellipsoid, ePosition, eVelocity));
        ret = rpa(ellipsoid.coordinatesToR3(ret));

        velocity.set(ret);

        freePoolAlloc();

        return velocity;
    }
}

export default new Physics();