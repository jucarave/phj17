import { ShaderStruct } from './ShaderStruct';

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
        
        uniform sampler2D uTexture;

        varying vec2 vTexCoords;

        void main(void) {
            gl_FragColor = texture2D(uTexture, vTexCoords);
        }
    `
};

export default Basic;