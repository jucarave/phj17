import Instance from '../entities/Instance';
import PlayerComponent from '../components/PlayerComponent';
import Renderer from '../engine/Renderer';
import Camera from '../engine/Camera';

class EntityFactory {
    public createPlayer(renderer: Renderer, camera: Camera): Instance {
        let ret: Instance = new Instance(renderer),
        playerComponent = new PlayerComponent();

        playerComponent.setCamera(camera);

        ret.addComponent(playerComponent);

        return ret;
    }
}

export default (new EntityFactory());