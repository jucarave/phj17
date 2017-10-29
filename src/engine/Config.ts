let Config = {
    PLAY_FULLSCREEN        : false,
    DISPLAY_COLLISIONS     : false,

    PIXEL_UNIT_RELATION    : 1 / 16,

    setUnitPixelsWidth: function(width: number) {
        this.PIXEL_UNIT_RELATION = 1 / width;
    }
};

export default Config;