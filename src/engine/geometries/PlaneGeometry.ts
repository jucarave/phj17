import Geometry from '../geometries/Geometry';

class PlaneGeometry extends Geometry {
    constructor(width: number, height: number) {
        super();

        this._buildPlane(width, height);
    }

    private _buildPlane(width: number, height: number): void {
        let w = width / 2,
            h = height / 2;

        // Top face
        this.addVertice(-w,  0,  h);
        this.addVertice( w,  0,  h);
        this.addVertice(-w,  0, -h);
        this.addVertice( w,  0, -h);

        this.addTriangle(0, 1, 2);
        this.addTriangle(1, 3, 2);

        this.addTexCoord(0.0, 1.0);
        this.addTexCoord(1.0, 1.0);
        this.addTexCoord(0.0, 0.0);
        this.addTexCoord(1.0, 0.0);
    }
}

export default PlaneGeometry;