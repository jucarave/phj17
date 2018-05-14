import { Vector4 } from '../../../engine';

export type CHARA_UVS = {
    FRONT: Vector4,
    LEFT: Vector4,
    RIGHT: Vector4,
    BACK: Vector4,
}

const UVManager = {
    CITY: {
        ALLEY_FLOOR: new Vector4(1, 1, 16, 16),
        ALLEY_FENCE: new Vector4(19, 1, 16, 32),
        ALLEY_BACK_WALL: new Vector4(1, 19, 16, 36),

        BAR_FLOOR_SIGN: new Vector4(22, 76, 10, 11),
        BAR_EXT_WALL: new Vector4(1, 53, 16, 48),

        BLACK_WINDOW: new Vector4(19, 40, 16, 16),

        BLACK_BUILDING: new Vector4(1, 103, 16, 16)
    },

    NPCS: {
        ALLEY_PERSON: <CHARA_UVS>{
            FRONT: new Vector4(1, 1, 12, 25),
            LEFT: new Vector4(25, 1, -12, 25),
            RIGHT: new Vector4(13, 1, 12, 25),
            BACK: new Vector4(25, 1, 12, 25)
        }
    }
}

export default UVManager;