import KeyFrame from './KeyFrame';
import Joint from './Joint';
import Matrix4 from '../math/Matrix4';
import Vector3 from '../math/Vector3';
import Quaternion from '../math/Quaternion';

interface AnimationJoints {
    joint:          string;
    keyframes:      Array<{
                        time: number;
                        pose: Array<number>;
                    }>
}

class Animation3D {
    private _keyframes          : Array<KeyFrame>;
    private _time               : number;
    private _position           : Vector3;
    private _rotation           : Quaternion;
    
    public frameIndex           : number;
    public speed                : number;

    constructor(keyframes: Array<KeyFrame>) {
        this._keyframes = keyframes;
        this._time = 0;
        this._position = new Vector3();
        this._rotation = new Quaternion();

        this.frameIndex = 0;
        this.speed = 1 / 60;
    }

    public getPosition(jointName: string): Vector3 {
        const ckf = this.currentKeyframe,
            nkf = this.nextFrame,
            
            time = (this._time - ckf.time) / (nkf.time - ckf.time);

        this._position.copy(this.currentKeyframe.getJoint(jointName).position);
        this._position.lerp(nkf.getJoint(jointName).position, time);
        
        return this._position;
    }

    public getRotation(jointName: string): Quaternion {
        const ckf = this.currentKeyframe,
            nkf = this.nextFrame,
            
            time = (this._time - ckf.time) / (nkf.time - ckf.time);

        this._rotation.copy(this.currentKeyframe.getJoint(jointName).rotation);
        this._rotation.slerp(nkf.getJoint(jointName).rotation, time);
        
        return this._rotation;
    }

    public update(): Animation3D {
        const nextFrame = this.nextFrame;

        this._time += this.speed;
        if (this._time >= nextFrame.time) {
            this.frameIndex += 1;
        }

        if (this.frameIndex >= this._keyframes.length) {
            this.frameIndex = 0;
            this._time = 0;
        }

        return this;
    }

    public get currentKeyframe(): KeyFrame {
        return this._keyframes[this.frameIndex];
    }

    public get nextFrame(): KeyFrame {
        let frame = this.frameIndex + 1;
        if (frame >= this._keyframes.length) { frame =  0; }

        return this._keyframes[frame];
    }

    public get keyframes(): Array<KeyFrame> {
        return this._keyframes;
    }

    public static createFromJSONAnimation(jsonObject: Array<AnimationJoints>): Animation3D {
        const len = jsonObject[0].keyframes.length;

        let keyframes: Array<KeyFrame> = [];
        for (let j=0;j<len;j++) {
            const keyframe = new KeyFrame(jsonObject[0].keyframes[j].time);
            for (let i=0,animation;animation=jsonObject[i];i++) {
                const matrix = Matrix4.createFromArray(animation.keyframes[j].pose).transpose(),
                    joint = new Joint(animation.joint, i, matrix.getTranslation(), matrix.getQuaternion());

                keyframe.addJoint(joint);
            }

            keyframes.push(keyframe);
        }

        return new Animation3D(keyframes);
    }
}

export default Animation3D;