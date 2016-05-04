
/// <reference path="../typings/references.d.ts" />
declare var AirConsole;
import ControllerHUD from './controller/controller.hud';
import ToController from './interfaces/to.controller';
import ToScreen from './interfaces/to.screen';


const initController = () => {
  require('../less/controller.less');
  console.log('Controller online');
  const airconsole = new AirConsole({ "orientation": "landscape" });
  // const message: (device_id: number, msg: ToScreen) => void = airconsole.message;

  const controllerHud = new ControllerHUD(
    document.getElementById('default'),
    document.getElementById('leader'),
    document.getElementById('honk'),
    document.getElementById('main'),
    (cmd) => {
      // console.log('HUD heard ', cmd);
      airconsole.message(AirConsole.SCREEN, cmd);
    }
  );

  // /** Called when screen calls setActivePlayers() */
  // airconsole.onActivePlayersChange = (player) => {
  //   console.log(`onActivePlayersChange to ${player}`);
  //   const nick = airconsole.getNickname(
  //     airconsole.convertPlayerNumberToDeviceId(player));
  //   // controllerHud.setPlayerIdAndNick(player, nick);
  // };
  airconsole.onMessage = (from: number, data: ToController) => {
    // console.log(airconsole);
    console.log('CONTROLLER Heard message from ' + from, data);
    if (data.state) {
      controllerHud.SwitchTo(data.state.state);
    }
  }

  setTimeout(() => {
    airconsole.message(AirConsole.SCREEN, { move: 50 });
  }, 1500);
}

window.onload = initController;