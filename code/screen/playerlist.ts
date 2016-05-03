
/// <reference path="../../typings/references.d.ts" />

// import MainMenu from './mainmenu';
// import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import Player from './player';
import R = require('ramda');

/** Tracks active players, their attribute
*/
export class PlayerList {
  private players: Player[] = [];

  private static MAX_PLAYERS = 4;
  private static colorSet = [0x3366cc, 0xdc3912, 0xff9900, 0x109618, 0x990099, 0x0099c6]

  constructor() {
  }
  
  public addPlayer = (device_id:number) => {
    if (this.players.length > 4) return;
    
  }

}

export default PlayerList;