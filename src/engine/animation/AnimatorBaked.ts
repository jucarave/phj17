import Texture from '../Texture';
import Matrix4 from '../math/Matrix4';
import Vector4 from '../math/Vector4';

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

    public static bakeAnimator(): AnimatorBaked {
        const animator = new AnimatorBaked(64, 64),
            texture = animator.texture;

        const mat = Matrix4.createZRotation(45*Math.PI/180);
        for (let i=0;i<16;i++) {
            texture.plotPixel(i, 0, AnimatorBaked.numberToColor(mat.data[i]));
        }

        console.log(texture);

        return animator;
    }
}

export default AnimatorBaked;