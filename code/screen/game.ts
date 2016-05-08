
/// <reference path="../../typings/references.d.ts" />

import MainMenu from './mainmenu';
import ToController from '../interfaces/to.controller';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {ToScreen, ScreenRequest} from '../interfaces/to.screen';
import ControllerState from '../interfaces/controllerstate';
import PlayerList from './playerlist';
import Player from './player';

import Race from './race/race.tsx';

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
    private mainControls: HTMLElement,
    private raceElement: HTMLElement
  ) {
    this.airConsole.onConnect = this.onConnect;
    this.airConsole.onDisconnect = this.onDisconnect;
    this.airConsole.onMessage = this.onMessage;

    this.mainMenu = new MainMenu(mainControls, this.requestNewGame);
    this.playerList = new PlayerList();
    this.state = GameState.Lobby;
  }

  private onConnect = (device_id) => {
    console.log(`SCREEN - Device ${device_id} connected`);
    this.playerList.addPlayer(device_id);
    this.managePlayerRoster();
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
    //now set current player states
    this.playerList.Players.forEach((p) => {
      this.updateDeviceIdControllerState(p.DeviceId);
    });
    this.mainMenu.HandlePlayerList(this.playerList.Players);
  }

  private updateDeviceIdControllerState = (device_id: number) => {
    this.message(device_id,
      {
        state: this.getControllerStateFromDeviceId(device_id),
        color: this.getColorFromDeviceId(device_id)
      });
  }

  private getControllerStateFromDeviceId = (device_id: number): ControllerState => {
    switch (this.state) {
      case GameState.Game:
        // console.log('Racers', this.race.Racers);
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
  private getColorFromDeviceId = (device_id: number): number => {
    const player = R.find(p => p.DeviceId == device_id, this.playerList.Players);
    return player ? player.Color : 0x111111;
  }

  private message = (device_id: number, message: ToController) => {
    this.airConsole.message(device_id, message);
  }

  public DEBUG_RequestNewGame = () => {
    this.requestNewGame([
      new Player(0xFF3300, 4, 'One'),
      new Player(0x0033FF, 6, 'Two'),
    ]);
  }

  private requestNewGame = (players = this.playerList.Players) => {
    console.log('Requesting a new game with payload of ', this.mainMenu.CurrentGamePayload);

    //Switch the game state
    this.state = GameState.Game;
    this.mainMenu.Hide();

    this.race = new Race(
      players,
      this.raceElement,
      this.mainMenu.CurrentGamePayload.track.filename,
      () => {
        console.log('race done');
        this.mainMenu.Show();
      });

    //Set the controllers
    this.managePlayerRoster();
  }
}

export default Game;