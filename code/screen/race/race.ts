
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';
import Racer from './racer';

/** A Race controller
*/
export class Race {

  public get Racers() { return this.racers; }
  private racers: Racer[] = [];

  constructor(currentPlayers: Player[]) {
  }

}

export default Race;