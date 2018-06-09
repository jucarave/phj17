import { ShaderStruct } from '../shaders/ShaderStruct';
import { createUUID } from '../Utils';
import Texture from './glsl/Texture';
import Color from './glsl/Color';
import LightPerPixel from './glsl/LightPerPixel';
import Armature from './glsl/Armature';

let ForwardShader: ShaderStruct = {
    id: createUUID(),
    
    vertexShader: `
        precision mediump float;

        attribute vec3 aVertexPosition;

        uniform mat4 uProjection;
        uniform mat4 uPosition;

        ${Texture.vertexShader.definitions}
        ${LightPerPixel.vertexShader.definitions}
        ${Armature.vertexShader.definitions}

        void main(void) {
            vec4 position = vec4(aVertexPosition, 1.0);
            ${LightPerPixel.vertexShader.defineNormals}

            ${Armature.vertexShader.transformVertices}

            gl_Position = uProjection * uPosition * position;

            ${Texture.vertexShader.passVaryings}
            ${LightPerPixel.vertexShader.passVaryings}
        }
    `,

    fragmentShader: `
        precision mediump float;
        
        ${Color.fragmentShader.definitions}
        ${Texture.fragmentShader.definitions}
        ${LightPerPixel.fragmentShader.definitions}

        void main(void) {
            vec4 outColor = vec4(1.0);

            ${Color.fragmentShader.setBaseColor}

            ${Texture.fragmentShader.readTextureColor}

            ${LightPerPixel.fragmentShader.calculateLight}

            gl_FragColor = outColor;
        }
    `
};

export default ForwardShader;