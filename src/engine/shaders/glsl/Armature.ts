const Armature = {
    vertexShader: {
        definitions: `
            #ifdef USE_SKIN
                attribute vec4 aJointWeights;

                uniform mat4 uJoints[20];
            #endif
        `,

        transformVertices: `
            #ifdef USE_SKIN
                vec4 totalPosition = vec4(0.0);
                #ifdef USE_LIGHT
                    vec3 totalNormals = vec3(0.0);
                #endif

                float jointWeights[4];
                jointWeights[0] = aJointWeights.x;
                jointWeights[1] = aJointWeights.y;
                jointWeights[2] = aJointWeights.z;
                jointWeights[3] = aJointWeights.w;

                for (int i=0;i<4;i+=2) {
                    int index = int(jointWeights[i]);
                    float weight = jointWeights[i + 1];

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