
/// <reference path="../../typings/references.d.ts" />

// import MainMenu from './mainmenu';
// import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import Player from './player';
import R = require('ramda');

/** Tracks active players, their attribute
*/
export class PlayerList {
  public get Players() { return this.players; }
  public get Leader() { return this.players[0]; }
  public get Followers() { return R.tail(this.players); }

  private players: Player[] = [];

  private static MAX_PLAYERS = 4;
  private static COLOR_SET = [0x3366cc, 0xdc3912, 0xff9900, 0x109618, 0x990099, 0x0099c6]

  constructor() {
  }

  public addPlayer = (device_id: number) => {
    if (this.players.length > 4) return;
    const currentColors = R.map(R.prop('Color'), this.players);
    const newColor: number = (<any>R.find)(R.flip(R.contains)(currentColors), PlayerList.COLOR_SET) || 0xFF0000;
    this.players.push(new Player(newColor, device_id));
  }

  public removePlayer = (device_id: number) => {
    this.players = R.filter(
      R.pipe(R.prop('DeviceId'), R.eq(device_id)),
      this.players);
  }

}

export default PlayerList;