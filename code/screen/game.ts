
/// <reference path="../../typings/references.d.ts" />

import MainMenu from './mainmenu';
import ToController from '../interfaces/to.controller';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {ToScreen, ScreenRequest} from '../interfaces/to.screen';
import ControllerState from '../interfaces/controllerstate';
import PlayerList from './playerlist';

import Race from './race/race';

import * as R from 'ramda';


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
  private race: Race;

  constructor(
    private airConsole,
    mainControls: HTMLElement,
    renderCanvas: HTMLCanvasElement,
    playerHuds: Array<Element>
  ) {
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
  private onMessage = (device_id: number, data: ToScreen) => {
    console.log(`SCREEN - Device ${device_id} sent `, data);
    if (R.is(Number, data.request)) {
      console.log(`Heard request from ${device_id}`, data);
      switch (data.request) {
        case ScreenRequest.UpdateControllerState:
          this.updateDeviceIdControllerState(device_id);
          break;
        default:
      }
    }
    switch (this.state) {
      case GameState.Lobby:
        if (this.playerList.Leader.DeviceId == device_id && data.menu) {
          this.mainMenu.HandleCommandFromLeader(data.menu.cmd);
        }
        break;
      case GameState.Game:
        if (data.racer) {

        }
        break;
      default:
    }

  }

  private managePlayerRoster = () => {
    // const active_players = <number[]>this.airConsole.getActivePlayerDeviceIds();
    // const connected_controllers = <number[]>this.airConsole.getControllerDeviceIds();

    // const targetPlayers = Math.min(4, connected_controllers.length);
    // console.log(`active players ${active_players.length} vs controllers ${connected_controllers.length} and target players of ${targetPlayers}`);
    // this.airConsole.setActivePlayers(targetPlayers);

    if (this.playerList.Players.length < 1) return;

    //now set current player states
    this.playerList.Players.forEach((p) => {
      this.updateDeviceIdControllerState(p.DeviceId);
    });
    this.mainMenu.HandlePlayerList(this.playerList.Players);
  }

  private updateDeviceIdControllerState = (device_id: number) => {
    this.message(device_id, { state: this.getControllerStateFromDeviceId(device_id) });
  }

  private getControllerStateFromDeviceId = (device_id: number): ControllerState => {
    switch (this.state) {
      case GameState.Game:
        const isRacing = R.pipe(
          R.map(R.prop('DeviceId')),
          R.contains(device_id)
        )(this.race.Racers);
        return isRacing ? ControllerState.Main : ControllerState.Waiting;
      default:
      case GameState.Lobby:
        return (this.playerList.Leader.DeviceId == device_id) ?
          ControllerState.Leader :
          ControllerState.Honk;
    }
  }

  private message = (device_id: number, message: ToController) => {
    this.airConsole.message(device_id, message);
  }

  private requestNewGame = () => {
    console.log('Requesting a new game with payload of ', this.mainMenu.CurrentGamePayload);

    //Switch the game state
    this.state = GameState.Game;

    // collect current device_ids and colors into racers


    // pass racers into race object
  }
}

export default Game;