import Geometry from '../geometries/Geometry';

class WallGeometry extends Geometry {
    constructor(width: number, height: number) {
        super();

        this._buildWall(width, height);
    }

    private _buildWall(width: number, height: number): void {
        let w = width / 2,
            h = height / 2;

        this.addVertice(-w, -h,  0);
        this.addVertice( w, -h,  0);
        this.addVertice(-w,  h,  0);
        this.addVertice( w,  h,  0);
        for (let i=0;i<4;i++) { this.addNormal(0.0, 0.0, 1.0); }
        
        this.addTriangle(0, 1, 2);
        this.addTriangle(1, 3, 2);

        this.addTexCoord(0.0, 1.0);
        this.addTexCoord(1.0, 1.0);
        this.addTexCoord(0.0, 0.0);
        this.addTexCoord(1.0, 0.0);
    }
}

export default WallGeometry;