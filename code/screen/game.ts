
/// <reference path="../../typings/references.d.ts" />

import MainMenu from './mainmenu';
import ToController from '../interfaces/to.controller';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {ControllerCommand, ControllerState} from '../interfaces/controllercommand';
import PlayerList from './playerlist';

export enum GameState {
  Lobby,
  Game
}

/** Main controller for the screen end of the game
 * Keeps track of which views are seen, which players are available,
 * and messages recieved
*/
export class Game {
  private mainMenu: MainMenu;
  private playerList: PlayerList;
  private state: GameState;

  constructor(private airConsole, mainControls: HTMLElement) {
    this.airConsole.onConnect = this.onConnect;
    this.airConsole.onDisconnect = this.onDisconnect;
    this.airConsole.onMessage = this.onMessage;

    this.mainMenu = new MainMenu(mainControls, this.requestNewGame);
    // this.playerList = new PlayerList(this.airConsole.getNickname);
    this.playerList = new PlayerList();
    this.state = GameState.Lobby;

    // setInterval(() => {
    //   this.mainMenu.HandleCommandFromLeader({ cmd: MenuCommands.Right });
    // }, 3000);

    // setInterval(() => {
    //   this.mainMenu.HandleCommandFromLeader({ cmd: MenuCommands.Choose });
    // }, 1000);
  }

  private onConnect = (device_id) => {
    // const player_id = this.airConsole.convertDeviceIdToPlayerNumber(device_id);
    console.log(`SCREEN - Device ${device_id} connected`);
    this.playerList.addPlayer(device_id);
    this.managePlayerRoster();
    // this.message(device_id, { msg: 'hey player! ' + device_id });
  }

  private onDisconnect = (device_id) => {
    console.log(`SCREEN - Device ${device_id} disconnected`);
    this.playerList.removePlayer(device_id);
    this.managePlayerRoster();
  }
  private onMessage = (device_id, data) => {
    console.log(`SCREEN - Device ${device_id} sent `, data);
  }

  private managePlayerRoster = () => {
    // const active_players = <number[]>this.airConsole.getActivePlayerDeviceIds();
    // const connected_controllers = <number[]>this.airConsole.getControllerDeviceIds();

    // const targetPlayers = Math.min(4, connected_controllers.length);
    // console.log(`active players ${active_players.length} vs controllers ${connected_controllers.length} and target players of ${targetPlayers}`);
    // this.airConsole.setActivePlayers(targetPlayers);

    if (this.playerList.Players.length < 1) return;

    //now set current player states
    switch (this.state) {
      case GameState.Game:
        this.playerList.Players.forEach((p) => {
          this.message(p.DeviceId, { state: { state: ControllerState.Main } });
        });
        break;
      default:
      case GameState.Lobby:
        this.message(this.playerList.Leader.DeviceId, { state: { state: ControllerState.Leader } });
        this.playerList.Followers.forEach((p) => {
          this.message(p.DeviceId, { state: { state: ControllerState.Honk } });
        });
        break;
    }
    this.mainMenu.HandlePlayerList(this.playerList.Players);
  }

  private message = (device_id: number, message: ToController) => {
    this.airConsole.message(device_id, message);
  }

  private requestNewGame = () => {
    console.log('Requesting a new game with payload of ', this.mainMenu.CurrentGamePayload);
  }
}

export default Game;