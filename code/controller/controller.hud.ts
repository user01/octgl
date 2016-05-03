
/// <reference path="../../typings/references.d.ts" />

import {MenuCommand} from '../interfaces/menucommand';
import {ControllerCommand, ControllerState} from '../interfaces/controllercommand';

/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private trackName: HTMLHeadingElement;
  private huds: HTMLElement[];

  private hackElm;

  constructor(
    private defaultOverlay: HTMLElement,
    private leaderOverlay: HTMLElement,
    private honkOverlay: HTMLElement,
    private mainOverlay: HTMLElement,
    private handleNewCommand: (cmd: MenuCommand) => void) {

    this.huds = [
      defaultOverlay,
      leaderOverlay,
      honkOverlay,
      mainOverlay,
    ];
    this.switchTo(ControllerState.Default);
    this.hackElm = defaultOverlay.getElementsByClassName("screen-header")[0];
  }

  public setPlayerIdAndNick = (id: number, nick: string) => {
    this.hackElm.innerText = `Heard: ${id} - ${nick}`;
  }

  private hideAll = () => {
    this.huds.forEach((elm) => {
      elm.style.zIndex = '0';
    })
  }
  private switchTo = (state: ControllerState) => {
    this.hideAll();
    switch (state) {
      case ControllerState.Default:
        this.defaultOverlay.style.zIndex = '1';
        break;
      case ControllerState.Honk:
        this.honkOverlay.style.zIndex = '1';
        break;
      case ControllerState.Leader:
        this.leaderOverlay.style.zIndex = '1';
        break;
      case ControllerState.Main:
        this.mainOverlay.style.zIndex = '1';
        break;
      default:
    }
  }
}


export default ControllerHUD;