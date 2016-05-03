import RacerCommand from './racercommand';
import ControllerCommand from './controllercommand';

export interface ToController {
  state?: ControllerCommand;
}

export default ToController;