import Joint from './Joint';

interface JointMap {
    [index: string]: Joint;
}

class KeyFrame {
    private _joints             : JointMap;

    public readonly time        : number;

    constructor(time: number) {
        this.time = time;
        
        this._joints = {};
    }

    public addJoint(joint: Joint): void {
        this._joints[joint.name] = joint;
    }

    public getJoint(jointName: string): Joint {
        return this._joints[jointName];
    }
}

export default KeyFrame;