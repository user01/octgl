import RacerCommand from './racercommand';
import ControllerCommand from './controllercommand';
import MenuCommand from './menucommand';

export interface ToScreen {
  racer?: RacerCommand;
  menu?: MenuCommand;
}

export default ToScreen;