import Ellipsoid from 'engine/physics/Ellipsoid';
import { Vector3 } from 'engine/math/Vector3';

const buffer = new ArrayBuffer(4),
    floatBuffer = new Float32Array(buffer),
    int32Buffer = new Uint32Array(buffer);

function bInt(floatNumber: number): number {
    floatBuffer[0] = floatNumber;
    return int32Buffer[0];
}

class Triangle {
    private _basePoints     : Array<Vector3>;
    private _points         : Array<Vector3>;
    private _edges          : Array<Vector3>;
    private _normal         : Vector3;
    private _plane          : number;

    constructor(p1: Vector3 = null, p2: Vector3 = null, p3: Vector3 = null) {
        this._basePoints = [p1, p2, p3];

        this._normal = new Vector3(0.0, 0.0, 0.0);
    }

    private _calculateNormal(): void {
        let e1 = Vector3.difference(this.p2, this.p1),
            e2 = Vector3.difference(this.p3, this.p1),
            n = Vector3.cross(e1, e2).normalize();

        this._normal.set(n);

        e1.delete();
        e2.delete();
        n.delete();
    }

    private _calculateEdges(): void {
        this._edges.push(Vector3.difference(this.p2, this.p1));
        this._edges.push(Vector3.difference(this.p3, this.p2));
        this._edges.push(Vector3.difference(this.p1, this.p3));
    }
    
    public calculatePlaneEquation(): void {
        let n = this._normal,
            p = this.p1;

        this._plane = -(n.x*p.x+n.y*p.y+n.z*p.z);
    }

    public translateToSpace(ellipsoid: Ellipsoid, position: Vector3): void {
        this._points = [
            ellipsoid.coordinatesToESpace(this._basePoints[0]).add(position),
            ellipsoid.coordinatesToESpace(this._basePoints[1]).add(position),
            ellipsoid.coordinatesToESpace(this._basePoints[2]).add(position)
        ];

        this._edges = [];
        
        this._calculateEdges();
        this._calculateNormal();
        this.calculatePlaneEquation();

        ellipsoid;
    }

    public clearTriangle(): void {
        for (let i=0;i<3;i++) {
            this._points[i].delete();
            this._edges[i].delete();
        }

        this._points = null;
        this._edges = null;
    }

    public isFrontFacing(direction: Vector3): boolean {
        return (Vector3.dot(this._normal, direction) <= 0);
    }

    public signedDistanceTo(point: Vector3): number {
        return Vector3.dot(point, this._normal) + this._plane;
    }

    public isPointInTriangle(point: Vector3): boolean {
        let v1 = Vector3.difference(this.p2, this.p1),
            v2 = Vector3.difference(this.p3, this.p1),
            vp = Vector3.difference(point, this.p1);

        let a = Vector3.dot(v1, v1),
            b = Vector3.dot(v1, v2),
            c = Vector3.dot(v2, v2),
            d = Vector3.dot(vp, v1),
            e = Vector3.dot(vp, v2),
            ac_bb=(a*c)-(b*b),
            x = (d*c)-(e*b),
            y = (e*a)-(d*b),
            z = x+y-ac_bb;

        
        let result = (bInt(z)& ~(bInt(x)|bInt(y)) & 0x80000000) != 0;

        v1.delete();
        v2.delete();
        vp.delete();

        return result;
    }

    public getPoint(index: number): Vector3 {
        return this._points[index];
    }

    public getEdge(index: number): Vector3 {
        return this._edges[index];
    }

    public get p1(): Vector3 { return this._points[0]; }
    public set p1(point: Vector3){ this._points = [point]; }

    public get p2(): Vector3 { return this._points[1]; }
    public get p3(): Vector3 { return this._points[2]; }
    public get normal(): Vector3 { return this._normal; }

    public set normal(normal: Vector3) {
        this.normal.set(normal);
    }
}

export default Triangle;