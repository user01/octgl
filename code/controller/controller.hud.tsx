
/// <reference path="../../typings/references.d.ts" />

import {ToScreen, ScreenRequest} from '../interfaces/to.screen';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import {RacerCommand} from '../interfaces/racercommand';
import ControllerState from '../interfaces/controllerstate';
import Utility from '../data/utility';

import MainControls from './main.controls.tsx';
import MenuFollower from './menu.follower.tsx';
import MenuLeader from './menu.leader.tsx';
import Waiting from './waiting.tsx';
import Blocked from './blocked.tsx';

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';



/** Handles rendering of HUDs and catching of events
*/
export class ControllerHUD {
  private colorStr = '#FF00FF';
  private state = ControllerState.Idle;
  private periodicUpdateId: any;
  private static PERIODIC_UPDATE_MS = 2500;
  private currentRacerCommand: RacerCommand = {
    left: false,
    right: false,
    special: false
  };

  private get Playing() {
    return this.state == ControllerState.MainControls;
  }


  constructor(
    private rootElement: HTMLElement,
    private handleNewCommand: (msg: ToScreen) => void) {

    this.periodicUpdateId = setInterval(this.perodicUpdate, ControllerHUD.PERIODIC_UPDATE_MS);
    this.SwitchTo(ControllerState.Idle);
  }

  private render = () => {
    if (this.state == ControllerState.Blocked) {
      console.warn('BLOCKED');
    }
    // console.log('testing', this.state, 'v', ControllerState.Waiting);
    const style = {
      background: this.colorStr
    };
    const isWaiting =
      ReactDOM.render(
        (<div style={style} className="controls">
          {this.state == ControllerState.Blocked ? <Blocked /> : ''}
          {this.state == ControllerState.Idle ? <Waiting /> : ''}
          {this.state == ControllerState.MainControls ? <MainControls handleUpdatedRacerCommand={this.handleUpdatedRacerCommand}/> : ''}
          {this.state == ControllerState.MenuFollower ? <MenuFollower /> : ''}
          {this.state == ControllerState.MenuLeader ? <MenuLeader handleCommand={(cmd: MenuCommands) => {
            this.handleNewCommand({ menu: { cmd } });
          } } /> : ''}
        </div>), this.rootElement);
  }

  private handleUpdatedRacerCommand = (racer: RacerCommand) => {
    this.currentRacerCommand = racer;
    this.handleNewCommand({ racer: this.currentRacerCommand });
  }

  /** Force an update, in case the state gets dropped */
  private perodicUpdate = () => {
    if (this.Playing) {
      // rewrite the state of the racer
      this.handleNewCommand({ racer: this.currentRacerCommand });
    } else {
      // check for the controller state
      this.handleNewCommand({ request: ScreenRequest.UpdateControllerState });
    }
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
    this.state = state;
    this.render();
  }
  public Colorize = (color: number) => {
    this.colorStr = Utility.NumberToColor(color);
    this.render();
  }
}


export default ControllerHUD;