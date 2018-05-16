import { VERTICE_SIZE, TEXCOORD_SIZE } from '../Constants';
import Renderer from '../Renderer';
import Shader from '../shaders/Shader';
import Vector3 from '../math/Vector3';

interface BufferMap {
    vertexBuffer?               : WebGLBuffer;
    texCoordsBuffer?            : WebGLBuffer;
    indexBuffer?                : WebGLBuffer;
    glContext                   : WebGLRenderingContext;
}

interface RendererBufferMap {
    [index: string] : BufferMap;
}

class Geometry {
    private _vertices                : Array<number>;
    private _triangles               : Array<number>;
    private _texCoords               : Array<number>;
    private _buffers                 : RendererBufferMap;
    private _indexLength             : number;
    private _boundingBox             : Array<number>;
    
    protected _renderer              : Renderer;
    protected _dynamic               : boolean;

    public offset                    : Vector3;

    constructor() {
        this._vertices = [];
        this._texCoords = [];
        this._triangles = [];
        this._buffers = {};
        this._boundingBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        this.offset = new Vector3(0, 0, 0);

        this._dynamic = false;
    }

    public addVertice(x: number, y: number, z: number): void {
        this._vertices.push(x, y, z);

        // Calculate bounding box
        this._boundingBox = [
            Math.min(this._boundingBox[0], x),
            Math.min(this._boundingBox[1], y),
            Math.min(this._boundingBox[2], z),
            Math.max(this._boundingBox[3], x),
            Math.max(this._boundingBox[4], y),
            Math.max(this._boundingBox[5], z)
        ];
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
        const gl = renderer.GL,
            bufferMap: BufferMap = { glContext: gl };

        this._renderer = renderer;

        bufferMap.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertices), gl.STATIC_DRAW);

        bufferMap.texCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoords), gl.STATIC_DRAW);

        bufferMap.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferMap.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._triangles), gl.STATIC_DRAW);

        this._indexLength = this._triangles.length;

        this._buffers[renderer.id] = bufferMap;
    }

    public clearBoundBoxAxis(x: number = 0, y: number = 0, z: number = 0): Geometry {
        if (x == 1) {
            this._boundingBox[0] = 0;
            this._boundingBox[3] = 0;
        }
        
        if (y == 1) {
            this._boundingBox[1] = 0;
            this._boundingBox[4] = 0;
        }

        if (z == 1) {
            this._boundingBox[2] = 0;
            this._boundingBox[5] = 0;
        }

        return this;
    }

    public destroy(): void {
        for (let i in this._buffers){
            const bufferMap = this._buffers[i],
                gl = bufferMap.glContext;

            gl.deleteBuffer(bufferMap.vertexBuffer);
            gl.deleteBuffer(bufferMap.texCoordsBuffer);
            gl.deleteBuffer(bufferMap.indexBuffer);
        }
    }

    public render(renderer: Renderer): void {
        if (!this._buffers[renderer.id]) {
            this.build(renderer);
        }

        const gl = renderer.GL,
            shader = Shader.lastProgram,
            bufferMap = this._buffers[renderer.id];

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.vertexBuffer);
        gl.vertexAttribPointer(shader.attributes["aVertexPosition"], VERTICE_SIZE, gl.FLOAT, false, 0, 0);

        if (shader.attributes["aTexCoords"]) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.texCoordsBuffer);
            gl.vertexAttribPointer(shader.attributes["aTexCoords"], TEXCOORD_SIZE, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferMap.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this._indexLength, gl.UNSIGNED_SHORT, 0);
    }

    public get isDynamic(): boolean {
        return this._dynamic;
    }

    public get boundingBox(): Array<number> {
        return this._boundingBox;
    }
}

export default Geometry;