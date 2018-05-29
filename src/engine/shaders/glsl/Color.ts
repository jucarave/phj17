const Color = {
    fragmentShader: {
        definitions: `
            uniform vec4 uColor;
        `,

        setBaseColor: `
            outColor *= uColor;
        `
    }
}

export default Color;