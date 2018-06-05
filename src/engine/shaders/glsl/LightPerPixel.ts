const LightPerPixel = {
    vertexShader: {
        definitions: `
            #ifdef USE_LIGHT
                attribute vec3 aVertexNormal;

                varying vec3 vNormal;
            #endif
        `,

        passVaryings: `
            #ifdef USE_LIGHT
                vNormal = aVertexNormal;
            #endif
        `
    },

    fragmentShader: {
        definitions: `
            #ifdef USE_LIGHT
                struct DirectionalLight {
                    vec3 direction;
                    vec3 color;
                    float intensity;
                };

                uniform DirectionalLight uDirLight;
                uniform vec3 uAmbientLight;

                varying vec3 vNormal;
            #endif
        `,

        calculateLight: `
            #ifdef USE_LIGHT
                vec3 normal = normalize(vNormal);
                vec3 lightWeight = max(dot(normal, -uDirLight.direction), 0.0) * uDirLight.color * uDirLight.intensity;

                lightWeight += uAmbientLight;

                outColor.rgb *= lightWeight;
            #endif
        `
    }
}

export default LightPerPixel;