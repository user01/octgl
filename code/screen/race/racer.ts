
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';

/** A Racer Player
 * Hold information on location, references to babylon objects
 * and current data on race
*/
export class Racer extends Player {
  // public get DeviceId() { return this.device_id; }
  // public get Color() { return this.color; }

  constructor(color: number,
    deviceId: number,
    Nickname: string = 'Unknown'
  ) {
    super(color, deviceId, Nickname);
  }

  public static PlayersToRacers = (players: Player[]): Racer[] => {
    return [];
  }
}

export default Racer;