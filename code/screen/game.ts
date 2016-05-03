
/// <reference path="../../typings/references.d.ts" />

/** Main controller for the screen end of the game
 * Keeps track of which views are seen, which players are available,
 * and messages recieved
*/
export class Game {
  constructor(private airConsole) {
    this.airConsole.onConnect = this.onConnect;
    this.airConsole.onDisconnect = this.onDisconnect;
    this.airConsole.onMessage = this.onMessage;
  }

  private onConnect = (device_id) => {
    console.log(`Device ${device_id} connected`);
  }

  private onDisconnect = (device_id) => {
    console.log(`Device ${device_id} disconnected`);
  }
  private onMessage = (device_id, data) => {
    console.log(`Device ${device_id} sent `, data);
  }
}

export default Game;