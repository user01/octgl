
/// <reference path="../../typings/references.d.ts" />

import ToScreen from '../interfaces/to.screen';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {RacerCommand} from '../interfaces/racercommand';
import ControllerState from '../interfaces/controllerstate';
import Utility from '../data/utility';

import MainControls from './main.controls.tsx';
import MenuFollower from './menu.follower.tsx';
import MenuLeader from './menu.leader.tsx';
import Waiting from './waiting.tsx';

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';



/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private colorStr = '#FF00FF';
  private state = ControllerState.Idle;
  private periodicUpdateId: any;

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


  constructor(
    private rootElement: HTMLElement,
    private handleNewCommand: (msg: ToScreen) => void) {

    this.periodicUpdateId = setInterval(this.perodicUpdate, 2000);
    this.SwitchTo(ControllerState.Idle);
  }

  private render = () => {
    // console.log('testing', this.state, 'v', ControllerState.Waiting);
    const isWaiting =
      ReactDOM.render(
        (<div>
          {this.state == ControllerState.Idle ? <Waiting /> : ''}
          {this.state == ControllerState.MainControls ? <MainControls /> : ''}
          {this.state == ControllerState.MenuFollower ? <MenuFollower /> : ''}
          {this.state == ControllerState.MenuLeader ? <MenuLeader /> : ''}
        </div>), this.rootElement);
  }

  /** Force an update, in case the state gets dropped */
  private perodicUpdate = () => {
    this.handleNewCommand({ racer: this.currentRacerCommand });
  }

  // private assignClick = (elm: HTMLElement) => {
  //   const clickableBtns = elm.getElementsByClassName('btn');
  //   for (var i = 0; i < clickableBtns.length; i++) {
  //     let id = clickableBtns[i].id;
  //     let handlerOn = (evt) => {
  //       evt.preventDefault();
  //       // console.log('heard a click start from ', id);
  //       this.handleClickOn(id);
  //     };
  //     clickableBtns[i].addEventListener('touchstart', handlerOn, true);
  //     clickableBtns[i].addEventListener('mousedown', handlerOn, true);
  //     let handlerOff = (evt) => {
  //       evt.preventDefault();
  //       // console.log('heard a click end from ', id);
  //       this.handleClickOff(id);
  //     };
  //     clickableBtns[i].addEventListener('touchend', handlerOff, true);
  //     clickableBtns[i].addEventListener('mouseup', handlerOff, true);
  //   }
  // }
  // private handleClickOn = (id: string) => {
  //   // console.log(ControllerHUD.IDS_TO_CMDS[id], id, ControllerHUD.IDS_TO_CMDS);
  //   if (R.is(Number, ControllerHUD.IDS_TO_CMDS[id])) {
  //     this.handleNewCommand({ menu: { cmd: ControllerHUD.IDS_TO_CMDS[id] } });
  //     return;
  //   } else {
  //     this.toggleRacerId(id, true);
  //   }
  // }
  // private handleClickOff = (id: string) => {
  //   if (!R.is(Number, ControllerHUD.IDS_TO_CMDS[id])) {
  //     this.toggleRacerId(id, false);
  //   }
  // }
  // private toggleRacerId = (id: string, state: boolean) => {
  //   switch (id) {
  //     case 'button-upper-left':
  //       this.leftUpper = state;
  //       break;
  //     case 'button-lower-left':
  //       this.leftLower = state;
  //       break;
  //     case 'button-upper-right':
  //       this.rightUpper = state;
  //       break;
  //     case 'button-lower-right':
  //       this.rightLower = state;
  //       break;
  //     case 'button-special':
  //       this.special = state;
  //       break;
  //     default:
  //       console.error('bad id of ', id);
  //   }
  //   this.handleNewCommand({ racer: this.currentRacerCommand });
  // }

  public SwitchTo = (state: ControllerState) => {
    console.log('switch to ', state);
    this.state = state;
    this.render();
  }
  public Colorize = (color: number) => {
    this.colorStr = Utility.NumberToColor(color);
    this.render();
  }
}


export default ControllerHUD;