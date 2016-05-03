
/// <reference path="../typings/references.d.ts" />
declare var AirConsole;

import Game from './screen/game';

const initScreen = () => {
  console.log('Screen online');

  const game = new Game(new AirConsole());

}


window.onload = initScreen;