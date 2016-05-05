
/// <reference path="../../../typings/references.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import RacerHUD from './racer.hud.tsx';

/** A Race HUD controller
 * Grabs the DOM elements required
*/
export class RaceHUD {

  // constructor(private playerHuds: Array<HTMLElement>) {
  constructor(domElm: HTMLElement) {
    // console.log('render!');
    var t = 0;
    setInterval(()=>{
      ReactDOM.render(<RacerHUD device_id={t++} />, domElm);
    },2000);
  }

  /** Update components like lap/direction */
  public CurrentPaint = () => {

  }

  private hideAll = () => {
    // this.playerHuds.forEach(hud => hud.style.display = 'none');
  }
}

export default RaceHUD;