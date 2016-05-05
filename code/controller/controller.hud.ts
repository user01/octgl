
/// <reference path="../../typings/references.d.ts" />

import ToScreen from '../interfaces/to.screen';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {RacerCommand} from '../interfaces/racercommand';
import ControllerState from '../interfaces/controllerstate';
import * as R from 'ramda';

/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private trackName: HTMLHeadingElement;
  private huds: HTMLElement[];

  private get currentRacerCommand(): RacerCommand {
    return {
      left: this.left,
      right: this.right,
      special: this.special
    }
  };
  private leftUpper = false;
  private leftLower = false;
  private special = false;
  private rightUpper = false;
  private rightLower = false;
  private get left() { return this.leftUpper || this.leftLower; }
  private get right() { return this.rightUpper || this.rightLower; }

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
    private waitingOverlay: HTMLElement,
    private handleNewCommand: (msg: ToScreen) => void) {

    this.huds = [
      defaultOverlay,
      leaderOverlay,
      honkOverlay,
      mainOverlay,
      waitingOverlay
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
        // console.log('heard a click start from ', id);
        this.handleClickOn(id);
      };
      clickableBtns[i].addEventListener('touchstart', handlerOn, true);
      clickableBtns[i].addEventListener('mousedown', handlerOn, true);
      let handlerOff = (evt) => {
        evt.preventDefault();
        // console.log('heard a click end from ', id);
        this.handleClickOff(id);
      };
      clickableBtns[i].addEventListener('touchend', handlerOff, true);
      clickableBtns[i].addEventListener('mouseup', handlerOff, true);
    }
  }
  private handleClickOn = (id: string) => {
    // console.log(ControllerHUD.IDS_TO_CMDS[id], id, ControllerHUD.IDS_TO_CMDS);
    if (R.is(Number, ControllerHUD.IDS_TO_CMDS[id])) {
      this.handleNewCommand({ menu: { cmd: ControllerHUD.IDS_TO_CMDS[id] } });
      return;
    } else {
      this.toggleRacerId(id, true);
    }
  }
  private handleClickOff = (id: string) => {
    if (!R.is(Number, ControllerHUD.IDS_TO_CMDS[id])) {
      this.toggleRacerId(id, false);
    }
  }
  private toggleRacerId = (id: string, state: boolean) => {
    switch (id) {
      case 'button-upper-left':
        this.leftUpper = state;
        break;
      case 'button-lower-left':
        this.leftLower = state;
        break;
      case 'button-upper-right':
        this.rightUpper = state;
        break;
      case 'button-lower-right':
        this.rightLower = state;
        break;
      case 'button-special':
        this.special = state;
        break;
      default:
        console.error('bad id of ', id);
    }
    this.handleNewCommand({ racer: this.currentRacerCommand });
  }

  private hideAll = () => {
    this.huds.forEach((elm) => {
      elm.style.zIndex = '0';
    })
  }
  public SwitchTo = (state: ControllerState) => {
    this.hideAll();
    switch (state) {
      case ControllerState.Waiting:
        this.waitingOverlay.style.zIndex = '1';
        break;
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
  public Colorize = (color: number) => {
    const colorStr = `#${color.toString(16)}`;
    this.huds.forEach((elm) => {
      elm.style.background = colorStr;
    })
  }
}


export default ControllerHUD;