
/// <reference path="../../../typings/references.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import RacerHUD from './racer.hud.tsx';

/** A Race HUD controller
 * Grabs the DOM elements required
*/
export class RaceHUD {

  constructor(private playerHuds: Array<HTMLElement>) {
    // console.log('render!');
    // ReactDOM.render(<RacerHUD device_id={4} />, domElm);

  }

  /** Update components like lap/direction */
  public CurrentPaint = () => {

  }

  private hideAll = () => {
    this.playerHuds.forEach(hud => hud.style.display = 'none');
  }
}

export default RaceHUD;