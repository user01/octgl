
/// <reference path="../typings/references.d.ts" />
declare var AirConsole;
import ControllerHUD from './controller/controller.hud';

const initController = () => {
  require('../less/controller.less');
  console.log('Controller online');
  const airconsole = new AirConsole({ "orientation": "landscape" });

  const controllerHud = new ControllerHUD(
    document.getElementById('default'),
    document.getElementById('leader'),
    document.getElementById('honk'),
    document.getElementById('main'),
    (cmd) => {
      console.log('HUD heard ', cmd);
    }
  );

  /** Called when screen calls setActivePlayers() */
  airconsole.onActivePlayersChange = (player) => {
    console.log(`onActivePlayersChange to ${player}`);
    const nick = airconsole.getNickname(
      airconsole.convertPlayerNumberToDeviceId(player));
    controllerHud.setPlayerIdAndNick(player, nick);
  };
  airconsole.onMessage = (from, data) => {
    console.log(airconsole);
    console.log('Heard message ' + from, data);
  }

  setTimeout(() => {
    airconsole.message(AirConsole.SCREEN, { move: 50 });
  }, 1500);
}

window.onload = initController;