const LightPerPixel = {
    vertexShader: {
        definitions: `
            #ifdef USE_LIGHT
                attribute vec3 aVertexNormal;

                uniform mat4 uNormalMatrix;

                varying vec3 vNormal;
                varying vec3 vWorldPosition;
            #endif
        `,

        passVaryings: `
            #ifdef USE_LIGHT
                vNormal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
                vWorldPosition = (uNormalMatrix * vec4(aVertexPosition, 1.0)).xyz;
            #endif
        `
    },

    fragmentShader: {
        definitions: `
            #ifdef USE_LIGHT
                #define MAX_LIGHTS 4

                struct Light {
                    vec3 color;
                    vec3 position;
                    vec3 attenuation;
                    vec2 intensity;
                };
                
                uniform Light uDirLight;
                uniform Light uPointLights[MAX_LIGHTS];
                uniform int uNumberOfLights;

                varying vec3 vNormal;
                varying vec3 vWorldPosition;

                vec3 calculateLightWeight(Light light, vec3 direction, vec3 normal) {
                    vec3 ambientColor = light.color * light.intensity.x;
                    vec3 diffuseColor = light.color * light.intensity.y * max(dot(normal, direction), 0.0);

                    return ambientColor + diffuseColor;
                }

                vec3 calculatePointLights(vec3 worldPosition, vec3 normal) {
                    vec3 color = vec3(0.0);
                    for (int i=0;i<MAX_LIGHTS;i++) {
                        if (i == uNumberOfLights) { 
                            break;
                        }

                        Light light = uPointLights[i];
                        vec3 direction = light.position - worldPosition;
                        float distance = length(direction);

                        float attenuation = light.attenuation.x + light.attenuation.y * distance + light.attenuation.z * distance * distance;

                        color += calculateLightWeight(light, normalize(direction), normal) / attenuation;
                    }

                    return color;
                }
            #endif
        `,

        calculateLight: `
            #ifdef USE_LIGHT
                vec3 normal = normalize(vNormal);

                vec3 dirLightWeight = calculateLightWeight(uDirLight, normalize(-uDirLight.position), normal);
                vec3 pointLightWeight = calculatePointLights(vWorldPosition, normal);

                outColor.rgb *= dirLightWeight + pointLightWeight;
            #endif
        `
    }
}

export default LightPerPixel;