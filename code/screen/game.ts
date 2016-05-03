
/// <reference path="../../typings/references.d.ts" />

import MainMenu from './mainmenu';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';

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
    const player_id = this.airConsole.convertDeviceIdToPlayerNumber(device_id);
    console.log(`Device ${device_id} connected with player id of ${player_id}`);
    this.managePlayerRoster();
  }

  private onDisconnect = (device_id) => {
    const player_id = this.airConsole.convertDeviceIdToPlayerNumber(device_id);
    console.log(`Device ${device_id} disconnected, which had player of ${player_id}`);
    this.managePlayerRoster();
  }
  private onMessage = (device_id, data) => {
    const player_id = this.airConsole.convertDeviceIdToPlayerNumber(device_id);
    console.log(`Device ${device_id} / Player ${player_id} sent `, data);
  }

  private managePlayerRoster = () => {
    const active_players = <number[]>this.airConsole.getActivePlayerDeviceIds();
    const connected_controllers = <number[]>this.airConsole.getControllerDeviceIds();

    const targetPlayers = Math.min(4, connected_controllers.length);
    console.log(`active players ${active_players.length} vs controllers ${connected_controllers.length} and target players of ${targetPlayers}`);
    this.airConsole.setActivePlayers(targetPlayers);
    
    //now set current player states
  }

  private requestNewGame = () => {
    console.log('Requesting a new game with payload of ', this.mainMenu.CurrentGamePayload);
  }
}

export default Game;