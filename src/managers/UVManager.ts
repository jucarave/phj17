import { Vector4, vec4 } from 'engine/math/Vector4';

export type CHARA_UVS = {
    FRONT: Vector4,
    LEFT: Vector4,
    RIGHT: Vector4,
    BACK: Vector4,
}

const UVManager = {
    CITY: {
        ALLEY_FLOOR: vec4(1, 1, 16, 16),
        ALLEY_FENCE: vec4(19, 1, 16, 32),
        ALLEY_BACK_WALL: vec4(1, 19, 16, 36),

        BAR_FLOOR_SIGN: vec4(22, 76, 10, 11),
        BAR_EXT_WALL: vec4(1, 53, 16, 48),

        BLACK_WINDOW: vec4(19, 40, 16, 16),

        BLACK_BUILDING: vec4(1, 103, 16, 16)
    },

    NPCS: {
        ALLEY_PERSON: <CHARA_UVS>{
            FRONT: vec4(1, 1, 12, 25),
            LEFT: vec4(25, 1, -12, 25),
            RIGHT: vec4(13, 1, 12, 25),
            BACK: vec4(25, 1, 12, 25)
        }
    }
}

export default UVManager;