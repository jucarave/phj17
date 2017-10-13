import { VERTICE_SIZE } from '../../Constants';
import Renderer from '../Renderer';
import Shader from '../shaders/Shader';

class Geometry {
    private _vertices                : Array<number>;
    private _triangles               : Array<number>;
    private _texCoords               : Array<number>;
    private _vertexBuffer            : WebGLBuffer;
    private _texBuffer               : WebGLBuffer;
    private _indexBuffer             : WebGLBuffer;
    private _indexLength             : number;
    
    protected _renderer              : Renderer;

    constructor() {
        this._vertices = [];
        this._texCoords = [];
        this._triangles = [];
    }

    public addVertice(x: number, y: number, z: number): void {
        this._vertices.push(x, y, z);
    }
    
    public addTexCoord(x: number, y: number): void {
        this._texCoords.push(x, y);
    }

    public addTriangle(vert1: number, vert2: number, vert3: number): void {
        if (this._vertices[vert1 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert1 + "] not found!")}
        if (this._vertices[vert2 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert2 + "] not found!")}
        if (this._vertices[vert3 * VERTICE_SIZE] === undefined) { throw new Error("Vertice [" + vert3 + "] not found!")}

        this._triangles.push(vert1, vert2, vert3);
    }

    public build(renderer: Renderer): void {
        let gl = renderer.GL;

        this._renderer = renderer;

        this._vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);

        this._texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoords), gl.STATIC_DRAW);

        this._indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._triangles), gl.STATIC_DRAW);

        this._indexLength = this._triangles.length;

        this._vertices = null;
        this._texCoords = null;
        this._triangles = null;
    }

    public render(): void {
        let gl = this._renderer.GL,
            shader = Shader.lastProgram;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(shader.attributes["aVertexPosition"], VERTICE_SIZE, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
        gl.vertexAttribPointer(shader.attributes["aTexCoords"], 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        gl.drawElements(gl.TRIANGLES, this._indexLength, gl.UNSIGNED_SHORT, 0);
    }
}

export default Geometry;