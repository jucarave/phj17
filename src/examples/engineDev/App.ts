import { Renderer } from '../../engine';

class App {
    constructor() {
        const render = new Renderer(854, 480, document.getElementById("divGame"));

        render.clear();
    }
}

window.onload = () => new App();