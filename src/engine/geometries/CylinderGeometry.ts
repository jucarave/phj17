import Geometry from '../geometries/Geometry';
import { degToRad } from '../Utils';
import Vector3 from '../math/Vector3';

class CylinderGeometry extends Geometry {
    constructor(radius: number, steps: number, height: number, subdivisions: number) {
        super();

        this._buildCylinder(radius, steps, height, subdivisions);
    }

    private _buildCylinder(radius: number, steps: number, height: number, subdivisions: number): void {
        subdivisions -= 1;
        
        const increment = 360 / steps,
            verticalIncrement = height / subdivisions;

        let ind = 0;

        for (let j=0;j<subdivisions;j++) {
            const y1 = j * verticalIncrement,
                y2 = (j + 1) * verticalIncrement;

            for (let i=0;i<360;i+=increment) {
                const x1 = Math.cos(degToRad(i)) * radius,
                    z1 = -Math.sin(degToRad(i)) * radius,
                    x2 = Math.cos(degToRad(i+increment)) * radius,
                    z2 = -Math.sin(degToRad(i+increment)) * radius,
                    
                    normal1 = new Vector3(x1, 0, z1).normalize(),
                    normal2 = new Vector3(x2, 0, z2).normalize();

                    this.addVertice(x1, y1, z1);
                    this.addNormal(normal1.x, normal1.y, normal1.z);
                    this.addTexCoord(i / 360, j / subdivisions);

                    this.addVertice(x2, y1, z2);
                    this.addNormal(normal2.x, normal2.y, normal2.z);
                    this.addTexCoord((i + increment) / 360, j / subdivisions);

                    this.addVertice(x1, y2, z1);
                    this.addNormal(normal1.x, normal1.y, normal1.z);
                    this.addTexCoord(i / 360, (j + 1) / subdivisions);

                    this.addVertice(x2, y2, z2);
                    this.addNormal(normal2.x, normal2.y, normal2.z);
                    this.addTexCoord((i + increment) / 360, (j + 1) / subdivisions);

                    this.addTriangle(ind + 0, ind + 1, ind + 2);
                    this.addTriangle(ind + 1, ind + 3, ind + 2);

                    ind += 4;
            }
        }
    }
}

export default CylinderGeometry;