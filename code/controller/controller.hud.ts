
/// <reference path="../../typings/references.d.ts" />

import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
// import * as TrackList from '../data/track.list';

/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private trackName: HTMLHeadingElement;
  private huds: HTMLElement[];
  private static defaultIndex = 0;
  private static leaderIndex = 1;
  private static honkIndex = 2;
  private static mainIndex = 3;
  
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
    this.switchTo(ControllerHUD.defaultIndex);
    this.hackElm = defaultOverlay.getElementsByClassName("screen-header")[0];
  }
  
  public setPlayerIdAndNick = (id:number,nick:string) => {
    this.hackElm.innerText = `Heard: ${id} - ${nick}`;
  }

  private hideAll = () => {
    this.huds.forEach((elm) => {
      elm.style.zIndex = '0';
    })
  }
  private switchTo = (index: number) => {
    this.hideAll();
    this.huds[index].style.zIndex = '1';
  }
}


export default ControllerHUD;