
/// <reference path="../typings/references.d.ts" />
declare var AirConsole;

const initController = () => {
  require('../less/controller.less');
  console.log('Controller online');
  const airconsole = new AirConsole({ "orientation": "landscape" });

  /** Called when screen calls setActivePlayers() */
  airconsole.onActivePlayersChange = function (player) {
    console.log(`onActivePlayersChange to ${player}`);
  };

  setTimeout(() => {
    airconsole.message(AirConsole.SCREEN, { move: 50 });
  }, 1500);
}

window.onload = initController;