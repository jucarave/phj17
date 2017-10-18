import Renderer from '../engine/Renderer';
import Geometry from '../engine/geometries/Geometry';
import Material from '../engine/materials/Material';
import { Vector3, vec3 } from '../math/Vector3';
import { httpRequest } from '../Utils';

interface Model {
    geometry: Geometry,
    material: Material
}

interface ModelMap {
    [index: string]: Model;
}

export type ModelNames = 'BarSign' | 'Dumpster' | 'BarWindow' | 'BarDoorFrame';

class ModelsManager {
    private _models                 : ModelMap;
    private _modelsCount            : number;
    private _modelsReady            : number;

    constructor() {
        this._models = {};
        this._modelsCount = 0;
        this._modelsReady = 0;
    }

    private _loadModel(modelName: string, renderer: Renderer): void {
        this._modelsCount++;
        httpRequest("data/" + modelName + ".obj", (data: string) => {
            let lines = data.split("\n"),
                vertices: Array<Vector3> = [],
                texCoords: Array<Vector3> = [],
                geometry = new Geometry(),
                indCount = 0;

            for (let i=0,line;line=lines[i];i++) {
                line = line.trim();
                if (line.charAt(0) == "#") { continue; }

                let args = line.split(" ");
                
                if (args[0] == "v") {
                    vertices.push(vec3(parseFloat(args[1]), parseFloat(args[2]), parseFloat(args[3])));
                }else if (args[0] == "vt") {
                    texCoords.push(vec3(parseFloat(args[1]), parseFloat(args[2])));
                }else if (args[0] == "f") {
                    for (let j=1;j<=3;j++) {
                        let indices = args[j].split("/"),
                            vertex = vertices[parseInt(indices[0]) - 1],
                            texCoord = texCoords[parseInt(indices[1]) - 1];

                        geometry.addVertice(vertex.x, vertex.y, vertex.z);
                        geometry.addTexCoord(texCoord.x, 1 - texCoord.y);
                    }

                    geometry.addTriangle(indCount++, indCount++, indCount++);
                }
            }

            geometry.build(renderer);

            this._modelsReady++;

            let obj: Model = {
                geometry: geometry,
                material: null
            }

            this._models[modelName] = obj;
        });
    }

    public init(renderer: Renderer): void {
        this._loadModel("BarSign", renderer);
        this._loadModel("Dumpster", renderer);
        this._loadModel("BarWindow", renderer);
        this._loadModel("BarDoorFrame", renderer);
    }

    public getModel(name: ModelNames): Model {
        return this._models[name];
    }

    public isReady(): boolean {
        return this._modelsCount == this._modelsReady;
    }
}

export default (new ModelsManager());