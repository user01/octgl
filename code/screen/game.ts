
/// <reference path="../../typings/references.d.ts" />

import MainMenu from './mainmenu';
import {MenuCommand, MenuCommands} from '../interfaces/leadercommand';

/** Main controller for the screen end of the game
 * Keeps track of which views are seen, which players are available,
 * and messages recieved
*/
export class Game {
  private mainMenu: MainMenu;
  constructor(private airConsole, mainControls: HTMLElement) {
    this.airConsole.onConnect = this.onConnect;
    this.airConsole.onDisconnect = this.onDisconnect;
    this.airConsole.onMessage = this.onMessage;

    this.mainMenu = new MainMenu(mainControls, this.requestNewGame);

    // setInterval(() => {
    //   this.mainMenu.HandleCommandFromLeader({ cmd: MenuCommands.Right });
    // }, 3000);

    // setInterval(() => {
    //   this.mainMenu.HandleCommandFromLeader({ cmd: MenuCommands.Choose });
    // }, 1000);
  }

  private onConnect = (device_id) => {
    console.log(`Device ${device_id} connected`);
  }

  private onDisconnect = (device_id) => {
    console.log(`Device ${device_id} disconnected`);
  }
  private onMessage = (device_id, data) => {
    console.log(`Device ${device_id} sent `, data);
  }

  private requestNewGame = () => {
    console.log('Requesting a new game with payload of ', this.mainMenu.CurrentGamePayload);
  }
}

export default Game;