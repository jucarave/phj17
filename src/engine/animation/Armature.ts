import Joint from './Joint';
import Matrix4 from '../math/Matrix4';
import { JSONModel, JSONJoint } from '../geometries/JSONGeometry';

class Armature {
    private _root           : Joint;
    private _rootMatrix     : Matrix4;
    
    public readonly joints         : Array<Joint>;

    constructor(rootJoint: Joint) {
        this._root = rootJoint;
        this._rootMatrix = Matrix4.createIdentity();
        this.joints = [];
    }

    public updatePose(): Armature {
        this._rootMatrix.setIdentity();
        this._root.updateAnimationMatrix(this._rootMatrix);

        return this;
    }

    public createJointsOrder(parent: Joint = this._root): Armature {
        this.joints[parent.index] = parent;

        for (let i=0,joint;joint=parent.children[i];i++) {
            this.createJointsOrder(joint);
        }

        return this;
    }

    private static getModelJoints(joints: Array<JSONJoint>): Array<Joint> {
        let ret: Array<Joint> = [];

        for (let i=0,jointModel;jointModel=joints[i];i++) {
            const bindMatrix = Matrix4.createFromArray(jointModel.bindMatrix).transpose(),
                joint = new Joint(jointModel.name, jointModel.index, bindMatrix.getTranslation(), bindMatrix.getQuaternion());
            
            ret.push(joint);

            if (jointModel.childs){
                const childs = Armature.getModelJoints(jointModel.childs);

                joint.children = childs;
            }
        }

        return ret;
    }

    public static createArmatureFromJSONModel(model: JSONModel): Armature {
        const rootJoint: Joint = Armature.getModelJoints([model.skin.joints])[0];

        rootJoint.calculateBindMatrix(Matrix4.createIdentity());

        let armature = new Armature(rootJoint);
        armature.createJointsOrder();
        armature.updatePose();

        return armature;
    }
}

export default Armature;