export interface MenuCommand {
  cmd: MenuCommands;
}

export enum MenuCommands {
  Left,
  Right,
  Up,
  Down,
  Choose,
  Honk
}

export default MenuCommand;