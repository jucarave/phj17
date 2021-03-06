import Vector4 from '../math/Vector4';

class Matrix4 {
    public data                 : Array<number>;
    public inUse                : boolean;

    constructor(...values: Array<number>) {
        this.data = new Array(16);

        if (values.length == 0) { return; }

        if (values.length != 16) {
            throw new Error("Matrix4 needs 16 values to be created");
        }

        for (let i=0;i<16;i++) {
            this.data[i] = values[i];
        }
    }

    public set(...values: Array<number>): Matrix4 {
        if (values.length != 16) {
            throw new Error("Matrix4 needs 16 values to be created");
        }

        for (let i=0;i<16;i++) {
            this.data[i] = values[i];
        }

        return this;
    }

    public copy(matrix: Matrix4): Matrix4 {
        for (let i=0;i<16;i++) {
            this.data[i] = matrix.data[i];
        }

        return this;
    }

    public multiply(matrixB: Matrix4): Matrix4 {
        let T: Array<number> = matrixB.data;

        let C1 = new Vector4(T[0], T[4], T[8], T[12]);
        let C2 = new Vector4(T[1], T[5], T[9], T[13]);
        let C3 = new Vector4(T[2], T[6], T[10], T[14]);
        let C4 = new Vector4(T[3], T[7], T[11], T[15]);

        T = this.data;
        let R1 = new Vector4(T[0], T[1], T[2], T[3]);
        let R2 = new Vector4(T[4], T[5], T[6], T[7]);
        let R3 = new Vector4(T[8], T[9], T[10], T[11]);
        let R4 = new Vector4(T[12], T[13], T[14], T[15]);

        this.set(
            Vector4.dot(R1, C1), Vector4.dot(R1, C2), Vector4.dot(R1, C3), Vector4.dot(R1, C4),
            Vector4.dot(R2, C1), Vector4.dot(R2, C2), Vector4.dot(R2, C3), Vector4.dot(R2, C4),
            Vector4.dot(R3, C1), Vector4.dot(R3, C2), Vector4.dot(R3, C3), Vector4.dot(R3, C4),
            Vector4.dot(R4, C1), Vector4.dot(R4, C2), Vector4.dot(R4, C3), Vector4.dot(R4, C4)
        );

        return this;
    }

    public multiplyVector(vector: Vector4): Vector4 {
        const T = this.data;

        return new Vector4(
            vector.x * T[0] + vector.y * T[4] + vector.z * T[8] + vector.w * T[12],
            vector.x * T[1] + vector.y * T[5] + vector.z * T[9] + vector.w * T[13],
            vector.x * T[2] + vector.y * T[6] + vector.z * T[10] + vector.w * T[14],
            vector.x * T[3] + vector.y * T[7] + vector.z * T[11] + vector.w * T[15]
        );
    }

    public translate(x: number, y: number, z: number = 0, relative: boolean = false): void {
        if (relative) {
            this.data[12] += x;
            this.data[13] += y;
            this.data[14] += z;
        } else {
            this.data[12] = x;
            this.data[13] = y;
            this.data[14] = z;
        }
    }

    public setIdentity(): Matrix4 {
        this.set(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        return this;
    }

    public printDebug(): void {
        let str: string = "";

        for (let i=0;i<16;i++) {
            let n = this.data[i];

            if (i % 4 == 0) { 
                str += "\n" + n.toFixed(2); 
            } else {
                str += " " + n.toFixed(2);
            }
        }

        console.log(str.trim());
    }

    public static createIdentity(): Matrix4 {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    public static createOrtho(width: number, height: number, znear: number, zfar: number): Matrix4 {
        let l = -width / 2.0,
            r = width / 2.0,
            b = -height / 2.0,
            t = height / 2.0,
            
            A = 2.0 / (r - l),
            B = 2.0 / (t - b),
            C = -2 / (zfar - znear),
            
            X = -(r + l) / (r - l),
            Y = -(t + b) / (t - b),
            Z = -(zfar + znear) / (zfar - znear);

        return new Matrix4(
            A, 0, 0, 0,
            0, B, 0, 0,
            0, 0, C, 0,
            X, Y, Z, 1
        );
    }

    public static createPerspective(fov: number, ratio: number, znear: number, zfar: number): Matrix4 {
        let S = 1 / Math.tan(fov / 2),
            R = S * ratio,
            A = -(zfar) / (zfar - znear),
            B = -(zfar * znear) / (zfar - znear);
        
        return new Matrix4(
            S, 0, 0,  0,
            0, R, 0,  0,
            0, 0, A, -1,
            0, 0, B,  0
        );
    }

    public static createTranslate(x: number, y: number, z: number): Matrix4 {
        return new Matrix4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        );
    }

    public static createXRotation(radians: number): Matrix4 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix4(
             1, 0, 0, 0,
             0, C,-S, 0,
             0, S, C, 0,
             0, 0, 0, 1
        );
    }

    public static createYRotation(radians: number): Matrix4 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix4(
             C, 0,-S, 0,
             0, 1, 0, 0,
             S, 0, C, 0,
             0, 0, 0, 1
        );
    }

    public static createZRotation(radians: number): Matrix4 {
        let C: number = Math.cos(radians),
            S: number = Math.sin(radians);

        return new Matrix4(
             C,-S, 0, 0,
             S, C, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1
        );
    }
}

export default Matrix4;