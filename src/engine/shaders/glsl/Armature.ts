const Armature = {
    vertexShader: {
        definitions: `
            #ifdef USE_SKIN
                attribute vec3 aJointWeights;

                #ifdef USE_BAKED_ANIMATIONS
                    uniform sampler2D uJointsTexture;
                #else
                    uniform mat4 uJoints[20];
                #endif
            #endif
        `,

        transformVertices: `
            #ifdef USE_SKIN
                vec4 totalPosition = vec4(0.0);
                #ifdef USE_LIGHT
                    vec3 totalNormals = vec3(0.0);
                #endif

                for (int i=0;i<3;i+=1) {
                    float jointWeight = aJointWeights[i];
                    float jointPart = floor(jointWeight / 10.0);
                    float weight = jointWeight - jointPart * 10.0;

                    int index = int(jointPart);

                    if (weight == 0.0) { continue; }

                    #ifdef USE_BAKED_ANIMATIONS
                        mat4 joint = mat4(1.0);
                    #else
                        mat4 joint = uJoints[index];
                    #endif

                    totalPosition += (joint * vec4(aVertexPosition, 1.0)) * weight;
                    
                    #ifdef USE_LIGHT
                        totalNormals += ((joint * vec4(aVertexNormal, 0.0)) * weight).xyz;
                    #endif
                }

                position = totalPosition;
                #ifdef USE_BAKED_ANIMATIONS
                    position.z += texture2D(uJointsTexture, vec2(0.0, 0.0)).r * 3.0;
                #endif

                #ifdef USE_LIGHT
                    normals = totalNormals;
                #endif
            #endif
        `
    }
}

export default Armature;