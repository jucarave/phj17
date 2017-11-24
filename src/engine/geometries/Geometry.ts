import { VERTICE_SIZE, TEXCOORD_SIZE } from 'engine/Constants';
import Renderer from 'engine/Renderer';
import Shader from 'engine/shaders/Shader';
import BoundingBox from 'engine/physics/BoundingBox'
import Triangle from 'engine/physics/Triangle'
import { Vector3 } from 'engine/math/Vector3';
import List from 'engine/List';

class Geometry {
    private _vertices                : Array<number>;
    private _indices                 : Array<number>;
    private _texCoords               : Array<number>;
    private _triangles               : List<Triangle>;
    private _vertexBuffer            : WebGLBuffer;
    private _texBuffer               : WebGLBuffer;
    private _indexBuffer             : WebGLBuffer;
    private _indexLength             : number;
    private _boundingBox             : BoundingBox;
    
    protected _renderer              : Renderer;
    protected _dynamic               : boolean;

    public offset                    : Vector3;

    constructor() {
        this._vertices = [];
        this._texCoords = [];
        this._indices = [];
        this._triangles = null;
        this._boundingBox = new BoundingBox();
        this.offset = new Vector3(0, 0, 0);

        this._dynamic = false;
    }

    private _buildTriangles(): void {
        this._triangles = new List();

        for (let i=0,len=this._indices.length;i<len;i+=3) {
            let v1_x = this._vertices[this._indices[i] * VERTICE_SIZE],
                v1_y = this._vertices[this._indices[i] * VERTICE_SIZE + 1],
                v1_z = this._vertices[this._indices[i] * VERTICE_SIZE + 2],

                v2_x = this._vertices[this._indices[i+1] * VERTICE_SIZE],
                v2_y = this._vertices[this._indices[i+1] * VERTICE_SIZE + 1],
                v2_z = this._vertices[this._indices[i+1] * VERTICE_SIZE + 2],

                v3_x = this._vertices[this._indices[i+2] * VERTICE_SIZE],
                v3_y = this._vertices[this._indices[i+2] * VERTICE_SIZE + 1],
                v3_z = this._vertices[this._indices[i+2] * VERTICE_SIZE + 2];

            this._triangles.push(new Triangle(new Vector3(v1_x, v1_y, v1_z), new Vector3(v2_x, v2_y, v2_z), new Vector3(v3_x, v3_y, v3_z)));
        }
    }

    public addVertice(x: number, y: number, z: number): void {
        this._vertices.push(x, y, z);

        // Calculate bounding box
        this._boundingBox.readjustSize(x, y, z);
    }
    
    public addTexCoord(x: number, y: number): void {
        this._texCoords.push(x, y);
    }

    public addTriangle(vert1: number, vert2: number, vert3: number): void {
        if (this._vertices[vert1 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert1 + "] not found!")}
        if (this._vertices[vert2 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert2 + "] not found!")}
        if (this._vertices[vert3 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert3 + "] not found!")}

        this._indices.push(vert1, vert2, vert3);
    }

    public build(renderer: Renderer, keepTriangles: boolean = false): void {
        let gl = renderer.GL;

        if (keepTriangles) {
            this._buildTriangles();
        }
        
        this._renderer = renderer;

        this._vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);

        this._texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoords), gl.STATIC_DRAW);

        this._indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices), gl.STATIC_DRAW);

        this._indexLength = this._indices.length;

        this._vertices = null;
        this._texCoords = null;
        this._indices = null;
    }

    public destroy(): void {
        let gl = this._renderer.GL;

        gl.deleteBuffer(this._vertexBuffer);
        gl.deleteBuffer(this._texBuffer);
        gl.deleteBuffer(this._indexBuffer);
    }

    public render(): void {
        let gl = this._renderer.GL,
            shader = Shader.lastProgram;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(shader.attributes["aVertexPosition"], VERTICE_SIZE, gl.FLOAT, false, 0, 0);

        if (shader.attributes["aTexCoords"]) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
            gl.vertexAttribPointer(shader.attributes["aTexCoords"], TEXCOORD_SIZE, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        gl.drawElements(gl.TRIANGLES, this._indexLength, gl.UNSIGNED_SHORT, 0);
    }

    public get isDynamic(): boolean {
        return this._dynamic;
    }

    public get boundingBox(): BoundingBox {
        return this._boundingBox;
    }

    public get triangles(): List<Triangle> {
        return this._triangles;
    }
}

export default Geometry;