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
    
    public frameIndex           : number;
    public speed                : number;

    constructor(keyframes: Array<KeyFrame>) {
        this._keyframes = keyframes;
        this._time = 0;

        this.frameIndex = 0;
        this.speed = 1 / 60;
    }

    public getPosition(jointName: string): Vector3 {
        return this.currentKeyframe.getJoint(jointName).position;
    }

    public getRotation(jointName: string): Quaternion {
        return this.currentKeyframe.getJoint(jointName).rotation;
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
        return this._keyframes[this.frameIndex << 0];
    }

    public get nextFrame(): KeyFrame {
        let frame = this.frameIndex << 0;
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