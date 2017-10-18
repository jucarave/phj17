import Instance from '../engine/entities/Instance';
import PlayerComponent from '../components/PlayerComponent';
import Renderer from '../engine/Renderer';
import Camera from '../engine/Camera';

abstract class EntityFactory {
    public static createPlayer(renderer: Renderer, camera: Camera): Instance {
        let ret: Instance = new Instance(renderer),
        playerComponent = new PlayerComponent();

        playerComponent.setCamera(camera);

        ret.addComponent(playerComponent);

        return ret;
    }
}

export default EntityFactory;