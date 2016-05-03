export interface ControllerCommand {
  state: ControllerState;
}

export enum ControllerState {
  Default,
  Leader,
  Honk,
  Main
}

export default ControllerCommand;