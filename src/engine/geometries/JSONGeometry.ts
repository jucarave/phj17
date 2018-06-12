import Geometry from './Geometry';

export interface JSONJoint {
    name: string;
    index: number;
    bindMatrix: Array<number>;
    childs?: Array<JSONJoint>;
}

export interface JSONModel {
    geometry: {
        vertices?: Array<Array<number>>;
        normals?: Array<Array<number>>;
        texCoords?: Array<Array<number>>;
        triangles: {
            indices: Array<Array<number>>;
            order: Array<"VERTEX" | "NORMAL" | "TEXCOORD">
        }
    },
    skin: {
        joints: JSONJoint;
        weights: Array<number>;
        indices: Array<Array<number>>;
    }
};

class JSONGeometry extends Geometry {
    constructor(jsonData: JSONModel) {
        super();

        this._parseData(jsonData);
        this._parseSkinning(jsonData);
    }

    private _parseData(jsonData: JSONModel): void {
        const geometry = jsonData.geometry,
            triangles = geometry.triangles;

        let added = 0,
            ind = 0;

        for (let i=0,triangle;triangle=triangles.indices[i];i++) {
            for (let j=0,len=triangle.length;j<len;j++) {
                const component = triangle[j];
                if (triangles.order[j] == "VERTEX") {
                    const vertex = geometry.vertices[component];
                    this.addVertice(vertex[0], vertex[1], vertex[2]);
                } else if (triangles.order[j] == "NORMAL") {
                    const normal = geometry.normals[component];
                    this.addNormal(normal[0], normal[1], normal[2]);
                } else if (triangles.order[j] == "TEXCOORD") {
                    const texCoord = geometry.texCoords[component];
                    this.addTexCoord(texCoord[0], texCoord[1]);
                }
            }

            if (++added == 3) {
                this.addTriangle(ind, ind + 1, ind + 2);
                ind += 3;
                added = 0;
            }
        }
    }

    private _parseSkinning(jsonData: JSONModel): void {
        const indices = jsonData.skin.indices,
            weights = jsonData.skin.weights,
            triangles = jsonData.geometry.triangles;

        for (let i=0,triangle;triangle=triangles.indices[i];i++) {
            const component = triangle[0],
                index = indices[component];

            let verticeWeights: Array<number> = [0, 0, 0, 0];
            for (let j=0,len=index.length;j<len;j+=2) {
                verticeWeights[j] = index[j];
                verticeWeights[j + 1] = weights[index[j + 1]];
            }

            this.addJointWeights(verticeWeights[0], verticeWeights[1], verticeWeights[2], verticeWeights[3]);
        }
    }
}

export default JSONGeometry;