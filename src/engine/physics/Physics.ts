import Body from 'engine/physics/Body';
import Ellipsoid from 'engine/physics/Ellipsoid';
import { Vector3 } from 'engine/math/Vector3';
import List from 'engine/List';
import { rememberPoolAlloc as rpa, freePoolAlloc} from 'engine/Utils';

export interface CollisionPackage {
    position                    : Vector3;
    velocity                    : Vector3;
    normalizedVelocity          : Vector3;
    foundCollision              : boolean;
}

const closeDistance = 0.005;

class Physics {
    private _bodies         : List<Body>;
    private _recursion      : number;

    constructor() {
        this._bodies = new List();
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

    private collideWithWorld(position: Vector3, velocity: Vector3): Vector3 {
        if (this._recursion > 5) {
            return velocity;
        }

        let collisionPack : CollisionPackage = {
            position: rpa(position.clone()),
            velocity: rpa(velocity.clone()),
            normalizedVelocity: rpa(velocity.clone().normalize()),
            foundCollision: false
        }

        this._checkCollision(collisionPack);

        if (!collisionPack.foundCollision) {
            return velocity;
        }

        return velocity;
    }

    public checkCollision(ellipsoid: Ellipsoid, velocity: Vector3): Vector3 {
        let ePosition = rpa(ellipsoid.coordinatesToESpace(ellipsoid.poisition)),
            eVelocity = rpa(ellipsoid.coordinatesToESpace(velocity));

        this._recursion = 0;

        let ret = this.collideWithWorld(ePosition, eVelocity);

        freePoolAlloc();

        return ret;
    }
}

export default new Physics();