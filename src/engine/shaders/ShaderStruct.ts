import Shader from 'engine/shaders/Shader';

export interface ShaderStruct {
    vertexShader: string,
    fragmentShader: string
}

export interface ShaderMap {
    [index: string]: Shader
};

export type ShadersNames = 'BASIC';