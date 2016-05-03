import RacerCommand from './racercommand';
import ControllerCommand from './controllercommand';

export interface ToScreen {
  racer?: RacerCommand;
  controller?: ControllerCommand;
}

export default ToScreen;