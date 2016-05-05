
/// <reference path="../../../typings/references.d.ts" />

/** A Racer Player
 * Hold information on location, references to babylon objects
 * and current data on race
*/
export class Racer {
  public get DeviceId() { return this.device_id; }
  public get Color() { return this.color; }

  constructor(
    private device_id: number,
    private color: number
  ) {

  }

}

export default Racer;