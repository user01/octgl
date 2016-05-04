
/// <reference path="../../../typings/references.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import RacerHUD from './racer.hud.tsx';

/** A Race HUD controller
 * Grabs the DOM elements required
*/
export class RaceHUD {

  constructor(domElm: HTMLElement) {
    console.log('render!');
    ReactDOM.render(<RacerHUD device_id={4} />, domElm);
  }

  /** Pick the correct  */
  public InitialPaint = () => {

  }
  /** Update components like lap/direction */
  public CurrentPaint = () => {

  }
}

export default RaceHUD;