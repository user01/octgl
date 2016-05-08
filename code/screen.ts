
/// <reference path="../typings/references.d.ts" />
declare var AirConsole;

import Game from './screen/game';
import Utility from './data/utility';
import RaceHUD from './screen/race/race.hud.tsx';

const getAirConsole = () => {
  try {
    return new AirConsole();
  } catch (e) {
    console.error('Unable to use airconsole', e);
    console.log('Falling back');
    return {
      message: (device_id: number, message: any) => { console.log('FAKE AIRCONSOLE HEARD', message) }
    };
  }
}

const initScreen = () => {
  console.log('Screen online');
  require('../less/screen.less');

  const game = new Game(
    getAirConsole(),
    document.getElementById('main'),
    document.getElementById('race-view')
  );

  const getParameterByName = (name, url?) => {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  if (getParameterByName('DEBUG') != null) {
    setTimeout(() => game.DEBUG_RequestNewGame(), 150);
  }

}


// window.onload = initScreen;
document.addEventListener('DOMContentLoaded', initScreen, false);