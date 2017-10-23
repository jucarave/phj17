import { ShaderStruct } from 'engine/shaders/ShaderStruct';

let Color: ShaderStruct = {
    vertexShader: `
        precision mediump float;

        attribute vec3 aVertexPosition;

        uniform mat4 uProjection;
        uniform mat4 uPosition;

        void main(void) {
            gl_Position = uProjection * uPosition * vec4(aVertexPosition, 1.0);
        }
    `,

    fragmentShader: `
        precision mediump float;

        uniform vec4 uColor;

        void main(void) {
            gl_FragColor = uColor;
        }
    `
};

export default Color;