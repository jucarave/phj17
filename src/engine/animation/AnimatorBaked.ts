import Texture from '../Texture';
import Vector4 from '../math/Vector4';
import Instance from '../entities/Instance';
import Animator from './Animator';

class AnimatorBaked {
    private _texture            : Texture;

    constructor(width: number|Texture, height?: number) {
        if ((<Texture>width).getTexture) {
            this._texture = <Texture> width;
        } else {
            this._texture = Texture.createDataTexture(<number> width, height);
        }
    }

    public get texture(): Texture {
        return this._texture;
    }

    private static numberToColor(num: number): Vector4 {
        const r = (num >= 0)? 2 : 0;

        num = Math.abs(num);
        
        const g = num << 0,
            b = ((num - g) * 100) << 0,
            a = ((((num - g) * 100) - b) * 100) << 0;

        return new Vector4(r, g, b, a);
    }

    public static bakeAnimator(animator: Animator, instance: Instance): AnimatorBaked {
        const textureSize = 128,
            animatorBaked = new AnimatorBaked(textureSize, textureSize),
            texture = animatorBaked.texture,
            armature = instance.armature;

        animator.setFrame(0);
        armature.update();

        let ind = 0;
        const length = armature.joints.length;

        for (let j=0;j<length;j++) {
            const mat = armature.joints[j].animationMatrix;

            for (let i=0;i<16;i++) {
                const x = ind % textureSize,
                    y = Math.floor(ind / textureSize);

                texture.plotPixel(x, y, AnimatorBaked.numberToColor(mat.data[i]));

                ind += 1;
            }
        }

        return animatorBaked;
    }
}

export default AnimatorBaked;