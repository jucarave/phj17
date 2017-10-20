import { vec4 } from '../engine/math/Vector4';

const UVManager = {
    CITY: {
        ALLEY_FLOOR: vec4(1, 1, 16, 16),
        ALLEY_FENCE: vec4(19, 1, 16, 32),
        ALLEY_BACK_WALL: vec4(1, 19, 16, 36),

        BAR_FLOOR_SIGN: vec4(22, 76, 10, 11),
        BAR_EXT_WALL: vec4(1, 53, 16, 48),

        BLACK_WINDOW: vec4(19, 40, 16, 16)
    }
}

export default UVManager;