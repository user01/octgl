import RacerCommand from './racercommand';
import ControllerCommand from './controllerstate';

export interface ToController {
  state?: ControllerCommand;
  color?: number;
}

export default ToController;