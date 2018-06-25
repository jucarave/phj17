import { BAKED_JOINTS_TEXTURE_SIZE } from '../../Constants';

const getJoint = `
    mat4 joint = mat4(1.0);

    float ind = offset;

    for (int x=0;x<3;x++) {
        for (int y=0;y<3;y++) {
            float tx = mod(ind, ANIMATION_TEXTURE_SIZE) / ANIMATION_TEXTURE_SIZE;
            float ty = floor(ind / ANIMATION_TEXTURE_SIZE) / ANIMATION_TEXTURE_SIZE;

            joint[x][y] = colorToNumber(texture2D(uJointsTexture, vec2(tx, ty))); 
            
            ind++;
        }
    }

    for (int y=0;y<3;y++) {
        float tx = mod(ind, ANIMATION_TEXTURE_SIZE) / ANIMATION_TEXTURE_SIZE;
        float ty = floor(ind / ANIMATION_TEXTURE_SIZE) / ANIMATION_TEXTURE_SIZE;

        joint[3][y] = colorToNumber(texture2D(uJointsTexture, vec2(tx, ty))); 
        
        ind++;
    }
`;

const Armature = {
    vertexShader: {
        definitions: `
            #ifdef USE_SKIN
                attribute vec3 aJointWeights;

                #ifdef USE_BAKED_ANIMATIONS
                    #define ANIMATION_TEXTURE_SIZE ${BAKED_JOINTS_TEXTURE_SIZE.toFixed(1)}

                    uniform sampler2D uJointsTexture;
                    uniform float uAnimationOffset;
                #else
                    uniform mat4 uJoints[20];
                #endif

                #ifdef USE_BAKED_ANIMATIONS
                    float colorToNumber(vec4 color) {
                        float r = (color.r * 255.0) - 127.0;
                        float g = color.g * 255.0;
                        float b = color.b * 255.0;

                        return (r + g / 100.0 + b / 10000.0);
                    }
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
                        float offset = 12.0 * float(index) + uAnimationOffset;
                        ${getJoint}
                    #else
                        mat4 joint = uJoints[index];
                    #endif

                    totalPosition += (joint * vec4(aVertexPosition, 1.0)) * weight;
                    
                    #ifdef USE_LIGHT
                        totalNormals += ((joint * vec4(aVertexNormal, 0.0)) * weight).xyz;
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