
/// <reference path="../../typings/references.d.ts" />

/** A Player state
*/
export class Player {

  public get Color() { return this.color; }
  public get DeviceId() { return this.deviceId }

  constructor(private color: number, private deviceId: number) {
  }

}

export default Player;