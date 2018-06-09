import Material from '../materials/Material';
import Renderer from '../Renderer';
import Texture from '../Texture';
import ForwardShader from '../shaders/Forward';
import Instance from '../entities/Instance';
import Camera from '../entities/Camera';
import Scene from '../Scene';
import { VERTICE_SIZE, TEXCOORD_SIZE, NORMALS_SIZE } from '../Constants';

class MaterialForward extends Material {
    private _color           : Array<number>;

    private _texture         : Texture;
    private _uv              : Array<number>;
    private _repeat          : Array<number>;
    private _receiveLight      : boolean;

    constructor() {
        super(ForwardShader);

        this._color = [1.0, 1.0, 1.0, 1.0];

        this._texture = null;
        this._uv = [0.0, 0.0, 1.0, 1.0];
        this._repeat = [1.0, 1.0];
    }

    private _renderInstanceProperties(renderer: Renderer, instance: Instance, camera: Camera): void {
        const gl = renderer.GL,
            program = this.shader.getProgram(renderer);

        gl.uniformMatrix4fv(program.uniforms["uProjection"], false, camera.projection.data);
        gl.uniformMatrix4fv(program.uniforms["uPosition"], false, instance.worldMatrix.data);

        if (this._receiveLight) {
            gl.uniformMatrix4fv(program.uniforms["uNormalMatrix"], false, instance.getTransformation().data);
        }
    }

    private _renderMaterialProperties(renderer: Renderer): void {
        if (!renderer.switchMaterial(this.id)) { return; }
        
        const gl = renderer.GL,
            program = this.shader.getProgram(renderer);

        if (this._texture != null) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this._texture.getTexture(renderer));
            gl.uniform1i(program.uniforms["uTexture"], 0);

            gl.uniform4fv(program.uniforms["uUV"], this._uv);
            gl.uniform2fv(program.uniforms["uRepeat"], this._repeat);
        }

        gl.uniform4fv(program.uniforms["uColor"], this._color);
    }

    private _renderWebGLProperties(gl: WebGLRenderingContext): void {
        if (this._renderBothFaces) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
        }
    }

    private _renderGeometryProperties(renderer: Renderer, instance: Instance): void {
        const gl = renderer.GL,
            program = this.shader.getProgram(renderer),
            geometry = instance.geometry,
            bufferMap = geometry.getBuffer(renderer);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.vertexBuffer);
        gl.vertexAttribPointer(program.attributes["aVertexPosition"], VERTICE_SIZE, gl.FLOAT, false, 0, 0);

        if (this._texture != null) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.texCoordsBuffer);
            gl.vertexAttribPointer(program.attributes["aTexCoords"], TEXCOORD_SIZE, gl.FLOAT, false, 0, 0);
        }

        if (this._receiveLight) {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferMap.normalsBuffer);
            gl.vertexAttribPointer(program.attributes["aVertexNormal"], NORMALS_SIZE, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferMap.indexBuffer);
    }

    private _renderLights(renderer: Renderer, instance: Instance, scene: Scene): void {
        if (!this._receiveLight) { return; }

        const gl = renderer.GL,
            program = this.shader.getProgram(renderer);

        const directionalLight = scene.directionalLight;
        gl.uniform3fv(program.uniforms["uDirLight.position"], directionalLight.direction.array);
        gl.uniform3fv(program.uniforms["uDirLight.color"], directionalLight.color.array);
        gl.uniform2fv(program.uniforms["uDirLight.intensity"], [directionalLight.ambientIntensity, directionalLight.diffuseIntensity]);

        const pointLights = instance.getIntersectingLights(),
            numberOfLights = Math.min(pointLights.length, 4);

        for (let i=0;i<numberOfLights;i++) {
            const light = pointLights[i];

            gl.uniform3fv(program.uniforms[`uPointLights[${i}].position`], light.globalPosition.array);
            gl.uniform3fv(program.uniforms[`uPointLights[${i}].color`], light.color.array);
            gl.uniform2f(program.uniforms[`uPointLights[${i}].intensity`], light.ambientIntensity, light.diffuseIntensity);
            gl.uniform3f(program.uniforms[`uPointLights[${i}].attenuation`], light.constantAttenuation, light.linearAttenuation, light.quadraticAttenuation);
        }

        gl.uniform1i(program.uniforms["uNumberOfLights"], numberOfLights);
    }

    public setColor(r: number, g: number, b: number, a: number): MaterialForward {
        this._color = [r, g, b, a];
        return this;
    }

    public setTextureUv(x: number, y: number, w: number, h: number): MaterialForward {
        this._uv = [x, y, w, h];
        return this;
    }
    
    public setTextureRepeat(x: number, y: number): MaterialForward {
        this._repeat = [x, y];
        return this;
    }

    public render(renderer: Renderer, instance: Instance, scene: Scene, camera: Camera): void {
        if (this._needsUpdate) {
            this.shader.deleteProgram(renderer.id);
            this._needsUpdate = false;
        }

        this.shader.useProgram(renderer);

        this._renderWebGLProperties(renderer.GL);
        this._renderInstanceProperties(renderer, instance, camera);
        this._renderMaterialProperties(renderer);
        this._renderLights(renderer, instance, scene);
        this._renderGeometryProperties(renderer, instance);

        const gl = renderer.GL,
            geometry = instance.geometry;
            
        gl.drawElements(gl.TRIANGLES, geometry.indexLength, gl.UNSIGNED_SHORT, 0);
    }

    public get isReady(): boolean {
        if (!this._texture) { return true; } 

        return this._texture.isReady;
    }

    public get texture(): Texture {
        return this._texture;
    }

    public set texture(texture: Texture) {
        (texture != null)? this.addConfig("USE_TEXTURE") : this.removeConfig("USE_TEXTURE");

        this._texture = texture;
    }

    public set receiveLight(receiveLight: boolean) {
        (receiveLight)? this.addConfig("USE_LIGHT") : this.removeConfig("USE_LIGHT");

        this._receiveLight = receiveLight;
    }

    public get receiveLight(): boolean {
        return this._receiveLight;
    }
}

export default MaterialForward;