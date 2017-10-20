import { ShaderStruct } from 'engine/shaders/ShaderStruct';

let Basic: ShaderStruct = {
    vertexShader: `
        precision mediump float;

        attribute vec3 aVertexPosition;
        attribute vec2 aTexCoords;

        uniform mat4 uProjection;
        uniform mat4 uPosition;

        varying vec2 vTexCoords;

        void main(void) {
            gl_Position = uProjection * uPosition * vec4(aVertexPosition, 1.0);

            vTexCoords = aTexCoords;
        }
    `,

    fragmentShader: `
        precision mediump float;
        
        uniform vec4 uUV;
        uniform vec2 uRepeat;
        uniform sampler2D uTexture;

        varying vec2 vTexCoords;

        void main(void) {
            vec2 coords = mod(clamp(vTexCoords, 0.0, 1.0) * uRepeat, 1.0) * uUV.zw + uUV.xy;

            //gl_FragColor = vec4(texture2D(uTexture, coords).rgb, 1.0);
            gl_FragColor = texture2D(uTexture, coords);;
        }
    `
};

export default Basic;