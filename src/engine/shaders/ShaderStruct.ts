import Shader from '../shaders/Shader';

export interface ShaderStruct {
    id: string,
    vertexShader: string,
    fragmentShader: string
}

export interface ShaderMap {
    [index: string]: Shader
};