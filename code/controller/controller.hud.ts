
/// <reference path="../../typings/references.d.ts" />

import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {RacerCommand} from '../interfaces/racercommand';
import {ControllerCommand, ControllerState} from '../interfaces/controllercommand';
import * as R from 'ramda';

/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private trackName: HTMLHeadingElement;
  private huds: HTMLElement[];

  private currentRacerCommand: RacerCommand = {
    left: false,
    right: false,
    special: false
  };

  private static IDS_TO_CMDS = {
    'leader-honk': MenuCommands.Honk,
    'leader-up': MenuCommands.Up,
    'leader-left': MenuCommands.Left,
    'leader-right': MenuCommands.Right,
    'leader-down': MenuCommands.Down,
    'leader-choose': MenuCommands.Choose,
  }

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
      let handlerOn = (evt) => {
        evt.preventDefault();
        console.log('heard a click start from ', id);
        this.handleClickOn(id);
      };
      clickableBtns[i].addEventListener('touchstart', handlerOn, true);
      clickableBtns[i].addEventListener('mousedown', handlerOn, true);
      let handlerOff = (evt) => {
        evt.preventDefault();
        console.log('heard a click end from ', id);
        this.handleClickOff(id);
      };
      clickableBtns[i].addEventListener('touchend', handlerOff, true);
      clickableBtns[i].addEventListener('mouseup', handlerOff, true);
    }
  }
  private handleClickOn = (id: string) => {
    // console.log(ControllerHUD.IDS_TO_CMDS[id], id, ControllerHUD.IDS_TO_CMDS);
    if (R.is(Number, ControllerHUD.IDS_TO_CMDS[id])) {
      this.handleNewCommand({ cmd: ControllerHUD.IDS_TO_CMDS[id] });
      return;
    }
    this.toggleRacerId(id, true);
  }
  private handleClickOff = (id: string) => {
    this.toggleRacerId(id, false);
  }
  private toggleRacerId = (id: string, state: boolean) => {
    switch (id) {
      case 'button-upper-left':
      case 'button-lower-left':
        break;
      default:
      // console.error('bad id of ', id);
    }
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
        // console.log('Showing Default');
        this.defaultOverlay.style.zIndex = '1';
        break;
      case ControllerState.Honk:
        // console.log('Showing Honk');
        this.honkOverlay.style.zIndex = '1';
        break;
      case ControllerState.Leader:
        // console.log('Showing Leader');
        this.leaderOverlay.style.zIndex = '1';
        break;
      case ControllerState.Main:
        // console.log('Showing Main');
        this.mainOverlay.style.zIndex = '1';
        break;
      default:
    }
  }
}


export default ControllerHUD;