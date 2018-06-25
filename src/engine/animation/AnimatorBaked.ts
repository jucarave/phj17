import Texture from '../Texture';
import Vector4 from '../math/Vector4';
import Instance from '../entities/Instance';
import Animator from './Animator';
import Matrix3 from '../math/Matrix3';
import { BAKED_JOINTS_TEXTURE_SIZE, BAKED_JOINTS_TEXTURE_DATA } from '../Constants';

class AnimatorBaked {
    private _texture            : Texture;
    
    public speed                : number;
    public frameIndex         : number;
    public framesNumber       : number;

    constructor(width: number|Texture, height?: number) {
        if ((<Texture>width).getTexture) {
            this._texture = <Texture> width;
        } else {
            this._texture = Texture.createDataTexture(<number> width, height);
        }

        this.frameIndex = 0;
        this.framesNumber = 1;
        this.speed = 24 / 60;
    }

    public update(): AnimatorBaked {
        this.frameIndex += this.speed;
        if (this.frameIndex >= this.framesNumber) {
            this.frameIndex = 0;
        }

        return this;
    }

    public get texture(): Texture {
        return this._texture;
    }

    public get textureOffset(): number {
        return (this.frameIndex << 0) * BAKED_JOINTS_TEXTURE_DATA;
    }

    private static numberToColor(num: number): Vector4 {
        num += 127;
        
        const r = num << 0,
            g = ((num - r) * 100) << 0,
            b = ((((num - r) * 100) - g) * 100) << 0;

        return new Vector4(r, g, b, 255);
    }

    public static bakeAnimator(animator: Animator, instance: Instance): AnimatorBaked {
        const textureSize = BAKED_JOINTS_TEXTURE_SIZE,
            animatorBaked = new AnimatorBaked(textureSize, textureSize),
            texture = animatorBaked.texture,
            armature = instance.armature;

        armature.animation = animator;
        animator.setFrame(0);
        animator.speed = 1 / 24;

        let ind = 0;
        const jointsLength = armature.joints.length,
            lastFrame = animator.lastFrameNumber,
            firstFrame = animator.firstFrameNumber,
            
            rotMat = Matrix3.createIdentity();

        for (let k=firstFrame;k<lastFrame;k++) {
            for (let j=0;j<jointsLength;j++) {
                const mat = armature.joints[j].animationMatrix;

                rotMat.setFromMatrix4(mat);

                for (let i=0;i<9;i++) {
                    const x = ind % textureSize,
                        y = Math.floor(ind / textureSize);

                    texture.plotPixel(x, y, AnimatorBaked.numberToColor(rotMat.data[i]));

                    ind += 1;
                }

                for (let i=0;i<3;i++) {
                    const x = ind % textureSize,
                        y = Math.floor(ind / textureSize);

                    texture.plotPixel(x, y, AnimatorBaked.numberToColor(mat.data[BAKED_JOINTS_TEXTURE_DATA + i]));

                    ind += 1;
                }
            }

            armature.update();
        }

        animatorBaked.framesNumber = lastFrame - firstFrame;

        return animatorBaked;
    }
}

export default AnimatorBaked;