const Armature = {
    vertexShader: {
        definitions: `
            #ifdef USE_ARMATURE
                attribute vec4 aJointWeights;

                uniform mat4 uBones[2];
            #endif
        `,

        transformVertices: `
            #ifdef USE_ARMATURE
                totalPosition = vec4(0.0);
                #ifdef USE_LIGHT
                    totalNormals = vec4(0.0);
                #endif

                float jointWeights[] = { aJointWeights.x, aJointWeights.y, aJointWeights.z, aJointWeights.w };

                for (int i=0;i<4;i+=2) {
                    int index = int(jointWeights[i]);
                    float weight = jointWeights[i + 1];

                    totalPosition += (uBones[index] * vec4(aVertexPosition, 1.0)) * weight;
                    
                    #ifdef USE_LIGHT
                        totalNormals += (uBones[index] * vec4(aVertexNormal, 0.0)) * weight;
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