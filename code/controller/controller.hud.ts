
/// <reference path="../../typings/references.d.ts" />

import {MenuCommand} from '../interfaces/menucommand';
import {ControllerCommand, ControllerState} from '../interfaces/controllercommand';

/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private trackName: HTMLHeadingElement;
  private huds: HTMLElement[];


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
    this.SwitchTo(ControllerState.Default);
    const x = defaultOverlay.getElementsByClassName("screen-header");
    this.huds.forEach(this.assignClick);
  }

  // public setPlayerIdAndNick = (id: number, nick: string) => {
  //   this.hackElm.innerText = `Heard: ${id} - ${nick}`;
  // }

  private assignClick = (elm: HTMLElement) => {
    const clickableBtns = elm.getElementsByClassName('btn');
    for (var i = 0; i < clickableBtns.length; i++) {
      let id = clickableBtns[i].id;
      let currentHandler = (evt) => {
        evt.preventDefault();
        console.log('heard a click start from ', id);
        this.handleClick(id);
      };
      clickableBtns[i].addEventListener('touchstart', currentHandler, true);
      clickableBtns[i].addEventListener('mousedown', currentHandler, true);
    }
  }
  private handleClick = (id:string) => {
    // switch (id) {
    //   case '':
        
    //     break;
    
    //   default:
    //     break;
    // }
  }

  private hideAll = () => {
    this.huds.forEach((elm) => {
      elm.style.zIndex = '0';
    })
  }
  public SwitchTo = (state: ControllerState) => {
    this.hideAll();
    switch (state) {
      case ControllerState.Default:
        console.log('Showing Default');
        this.defaultOverlay.style.zIndex = '1';
        break;
      case ControllerState.Honk:
        console.log('Showing Honk');
        this.honkOverlay.style.zIndex = '1';
        break;
      case ControllerState.Leader:
        console.log('Showing Leader');
        this.leaderOverlay.style.zIndex = '1';
        break;
      case ControllerState.Main:
        console.log('Showing Main');
        this.mainOverlay.style.zIndex = '1';
        break;
      default:
    }
  }
}


export default ControllerHUD;