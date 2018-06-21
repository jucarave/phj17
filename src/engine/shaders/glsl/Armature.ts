const Armature = {
    vertexShader: {
        definitions: `
            #ifdef USE_SKIN
                attribute vec3 aJointWeights;

                uniform mat4 uJoints[20];
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

                    totalPosition += (uJoints[index] * vec4(aVertexPosition, 1.0)) * weight;
                    
                    #ifdef USE_LIGHT
                        totalNormals += ((uJoints[index] * vec4(aVertexNormal, 0.0)) * weight).xyz;
                    #endif
                }

                position = totalPosition;
                #ifdef USE_LIGHT
                    normals = totalNormals;
                #endif
            #endif
        `
    }
}

export default Armature;