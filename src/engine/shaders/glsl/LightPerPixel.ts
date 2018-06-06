const LightPerPixel = {
    vertexShader: {
        definitions: `
            #ifdef USE_LIGHT
                attribute vec3 aVertexNormal;

                uniform mat4 uNormalMatrix;

                varying vec3 vNormal;
            #endif
        `,

        passVaryings: `
            #ifdef USE_LIGHT
                vNormal = (uNormalMatrix * vec4(aVertexNormal, 1.0)).xyz;
            #endif
        `
    },

    fragmentShader: {
        definitions: `
            #ifdef USE_LIGHT
                struct Light {
                    vec3 color;
                    vec3 direction;
                    float ambientIntensity;
                    float diffuseIntensity;
                };
                
                uniform Light uDirLight;

                varying vec3 vNormal;

                vec3 calculateLightWeight(Light light, vec3 direction, vec3 normal) {
                    vec3 ambientColor = light.color * light.ambientIntensity;
                    vec3 diffuseColor = light.color * light.diffuseIntensity * max(dot(normal, direction), 0.0);

                    return ambientColor + diffuseColor;
                }
            #endif
        `,

        calculateLight: `
            #ifdef USE_LIGHT
                vec3 normal = normalize(vNormal);

                vec3 dirLightWeight = calculateLightWeight(uDirLight, normalize(-uDirLight.direction), normal);

                outColor.rgb *= dirLightWeight;
            #endif
        `
    }
}

export default LightPerPixel;