import Vector3 from '../math/Vector3';
import Quaternion from '../math/Quaternion';
import Matrix4 from '../math/Matrix4';

class Joint {
    private _bindMatrix                     : Matrix4;
    private _invBindMatrix                  : Matrix4;
    private _animationMatrix                : Matrix4;

    public children                         : Array<Joint>;
    
    public readonly name                    : string;
    public readonly position                : Vector3;
    public readonly rotation                : Quaternion;
    public readonly index                   : number;

    constructor(name: string, index: number, position: Vector3 = new Vector3(), rotation: Quaternion = new Quaternion()) {
        this.name = name;
        this.index = index;
        this.position = position;
        this.rotation = rotation;

        this._bindMatrix = Matrix4.createIdentity();
        this._invBindMatrix = Matrix4.createIdentity();
        this._animationMatrix = Matrix4.createIdentity();

        this.children = [];
    }

    public addChild(joint: Joint) : Joint {
        this.children.push(joint);

        return this;
    }

    public updateAnimationMatrix(parentTransformationMatrix: Matrix4): void {
        const transformMatrix = Matrix4.createIdentity().copy(parentTransformationMatrix)
            .multiply(this.rotation.getRotationMatrix()
                .translate(this.position.x, this.position.y, this.position.z)
            );

        this._animationMatrix.copy(transformMatrix)
            .multiply(this._invBindMatrix);

        for (let i=0,child;child=this.children[i];i++) {
            child.updateAnimationMatrix(transformMatrix);
        }
    }

    public calculateBindMatrix(parentMatrix: Matrix4): Joint {
        this._bindMatrix.copy(parentMatrix)
            .multiply(this.rotation.getRotationMatrix().translate(this.position.x, this.position.y, this.position.z));
        
        this._invBindMatrix.copy(this._bindMatrix)
            .invert();

        for (let i=0,child;child=this.children[i];i++) {
            child.calculateBindMatrix(this._bindMatrix);
        }

        return this;
    }

    public getByName(name: string): Joint {
        if (this.name == name) {
            return this;
        }

        for (let i=0,joint;joint=this.children[i];i++) {
            const child = joint.getByName(name);
            if (child != null) {
                return child;
            }
        }

        return null;
    }

    public get animationMatrix(): Matrix4 {
        return this._animationMatrix;
    }
}

export default Joint;