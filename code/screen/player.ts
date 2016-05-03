
/// <reference path="../../typings/references.d.ts" />

/** A Player state
*/
export class Player {

  public get Color() { return this._color; }

  constructor(private _color: number) {
  }

}

export default Player;