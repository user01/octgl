import RacerCommand from './racercommand';
import MenuCommand from './menucommand';

export enum ScreenRequest {
  UpdateControllerState
}

export interface ToScreen {
  racer?: RacerCommand;
  menu?: MenuCommand;
  request?: ScreenRequest;
}

export default ToScreen;