
/// <reference path="../typings/references.d.ts" />
declare var AirConsole;
import ControllerHUD from './controller/controller.hud';
import ToController from './interfaces/to.controller';
import {ToScreen, ScreenRequest} from './interfaces/to.screen';
import * as R from 'ramda';


const initController = () => {
  require('../less/controller.less');
  console.log('Controller online');
  const airconsole = new AirConsole({ "orientation": "landscape" });
  const message = (device_id: number, msg: ToScreen) => {
    airconsole.message(device_id, msg);
  }

  const controllerHud = new ControllerHUD(
    document.getElementById('default'),
    document.getElementById('leader'),
    document.getElementById('honk'),
    document.getElementById('main'),
    document.getElementById('waiting'),
    (cmd) => {
      // console.log('HUD heard ', cmd);
      message(AirConsole.SCREEN, cmd);
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
    if (R.is(Number, data.state)) {
      controllerHud.SwitchTo(data.state);
    }
    if (R.is(Number, data.color)) {
      controllerHud.Colorize(data.color);
    }
  }

  setTimeout(() => {
    //forces this device to learn it's role
    console.log('Sending request');
    message(AirConsole.SCREEN, { request: ScreenRequest.UpdateControllerState });
  }, 250);
}

window.onload = initController;