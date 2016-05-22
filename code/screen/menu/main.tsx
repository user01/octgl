
/// <reference path="../../../typings/references.d.ts" />

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Promise from 'bluebird';

import {MenuCommand, MenuCommands} from '../../interfaces/menucommand';
import TrackList from '../../data/track.list';
import Player from '../player';

import ControlBox from './control.box.tsx';
import MapChoice from './map.choice.tsx';
import PlayerList from './player.list.tsx';

/** Controls selection of next track
 * Lists current player states
*/
export class MainMenu {
  private currentColumnIndex: number = 0;
  private currentTrackIndex: number = 0;

  private players: Player[] = [];
  private showMenu = true;

  private static NUMBER_OF_COLUMNS = 2;

  public get CurrentGamePayload() {
    return {
      track: this.currentTrack
    };
  }

  private render = () => {

    const mainStyle = {
      display: this.showMenu ? 'block' : 'none'
    };
    const leftControl = (<MapChoice track={this.currentTrack}/>);

    ReactDOM.render(
      (
        <div id="main" className="controls" style={mainStyle}>
          <div className="pure-g">
            <ControlBox pureClass="pure-u-1-2">
              {leftControl}
            </ControlBox>
            <ControlBox pureClass="pure-u-1-2">
              <PlayerList players={this.players}/>
            </ControlBox>
          </div>
        </div>
      ), this.mainControls);
  }
  private get currentTrack() {
    return TrackList[this.trackIndex];
  }

  private get columnIndex() {
    return Math.abs(this.currentColumnIndex) % MainMenu.NUMBER_OF_COLUMNS;
  }

  private get trackIndex() {
    return Math.abs(this.currentTrackIndex) % TrackList.length;
  }


  constructor(private mainControls: HTMLElement, private onNewGameRequest: () => void) {
    this.currentColumnIndex = 10000 * MainMenu.NUMBER_OF_COLUMNS;
    this.currentTrackIndex = 10000 * TrackList.length;
    this.render();
  }

  public Hide = () => {
    this.showMenu = false;
    this.render();
  }
  public Show = () => {
    this.showMenu = true;
    this.render();
  }

  public HandleCommandFromLeader = (cmd: MenuCommands) => {
    // console.log('cmd ', cmd, this.currentColumnIndex);
    switch (cmd) {
      case MenuCommands.Left:
        this.currentColumnIndex--;
        break;
      case MenuCommands.Right:
        this.currentColumnIndex++;
        break;
      case MenuCommands.Up:
        this.handleUpDown(true);
        break;
      case MenuCommands.Down:
        this.handleUpDown(false);
        break;
      case MenuCommands.Choose:
        // console.log('choose');
        this.handleChoose();
        break;
      default:
        console.error('Given invalid command', cmd);
    }
    this.render();
  }

  private handleChoose = () => {
    this.onNewGameRequest();
  }

  private handleUpDown = (up: boolean) => {
    switch (this.columnIndex) {
      case 0:
        // first column is track
        this.currentTrackIndex += up ? 1 : -1;
        break;
    }
  }

  public HandlePlayerList = (players: Player[]) => {
    this.players = players;
    this.render();
  }


}

export default MainMenu;