
/// <reference path="../../typings/references.d.ts" />

// import MainMenu from './mainmenu';
// import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import Player from './player';
import * as R from 'ramda';
import * as Promise from 'bluebird';

/** Tracks active players, their attribute
*/
export class PlayerList {
  public get Players() { return this.players; }
  public get Leader() { return this.players[0]; }
  public get Followers() { return R.tail(this.players); }

  private players: Player[] = [];

  private static MAX_PLAYERS = 4;
  private static COLOR_SET = [0x3366cc, 0xdc3912, 0xff9900, 0x109618, 0x990099, 0x0099c6]

  constructor(
    private getNickname = (device_id: number) => { return 'Unknown'; },
    private getProfilePicture = (device_id: number, image_size: number) => { return 'images/icon.jpg'; }
  ) {
  }

  public addPlayer = (device_id: number) => {
    if (this.players.length > 4) return;
    const currentColors = R.map(R.prop('Color'), this.players);
    const newColor: number = (<any>R.find)(
      R.pipe(R.flip(R.contains)(currentColors), R.not),
      PlayerList.COLOR_SET) || 0xFF0000;
    const nickname = this.getNickname(device_id);
    const picture = this.getProfilePicture(device_id, 128);
    
    this.players.push(
      new Player(newColor, device_id, nickname, picture)
    );
    console.log(`Added player ${device_id}/${nickname} - ${picture}`, this.players);
  }

  public removePlayer = (device_id: number) => {
    // console.log(R);
    this.players = R.filter(
      R.pipe(R.prop('DeviceId'), R.equals(device_id), R.not),
      this.players);
    console.log(`Removed player ${device_id}`, this.players);
  }

}

export default PlayerList;