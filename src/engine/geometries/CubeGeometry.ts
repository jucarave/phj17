import Geometry from './Geometry';
import Renderer from '../Renderer';

class CubeGeometry extends Geometry {
    constructor(renderer: Renderer, width: number, height: number, length: number) {
        super();

        this._renderer = renderer;

        this._buildCube(width, height, length);
    }

    private _buildCube(width: number, height: number, length: number): void {
        let w = width / 2,
            h = height / 2,
            l = length / 2;

        // Front face
        this.addVertice(-w, -h,  l);
        this.addVertice( w, -h,  l);
        this.addVertice(-w,  h,  l);
        this.addVertice( w,  h,  l);

        // Back face
        this.addVertice( w, -h, -l);
        this.addVertice(-w, -h, -l);
        this.addVertice( w,  h, -l);
        this.addVertice(-w,  h, -l);

        // Left face
        this.addVertice(-w, -h, -l);
        this.addVertice(-w, -h,  l);
        this.addVertice(-w,  h, -l);
        this.addVertice(-w,  h,  l);

        // Right face
        this.addVertice( w, -h,  l);
        this.addVertice( w, -h, -l);
        this.addVertice( w,  h,  l);
        this.addVertice( w,  h, -l);

        // Top face
        this.addVertice(-w,  h,  l);
        this.addVertice( w,  h,  l);
        this.addVertice(-w,  h, -l);
        this.addVertice( w,  h, -l);

        // Bottom face
        this.addVertice( w, -h,  l);
        this.addVertice(-w, -h,  l);
        this.addVertice( w, -h, -l);
        this.addVertice(-w, -h, -l);

        for (let i=0;i<6;i++) {
            let ind = i * 4;
            
            this.addTriangle(ind + 0, ind + 1, ind + 2);
            this.addTriangle(ind + 1, ind + 3, ind + 2);

            this.addTexCoord(0.0, 1.0);
            this.addTexCoord(1.0, 1.0);
            this.addTexCoord(0.0, 0.0);
            this.addTexCoord(1.0, 0.0);
        }

        this.build(this._renderer);
    }
}

export default CubeGeometry;