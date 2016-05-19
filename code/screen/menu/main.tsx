
/// <reference path="../../../typings/references.d.ts" />

import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Promise from 'bluebird';

import {MenuCommand, MenuCommands} from '../../interfaces/menucommand';
import * as TrackList from '../../data/track.list';
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

  public get CurrentGamePayload() {
    return {
      track: this.currentTrack
    };
  }

  private render = () => {

    const rawContents = [
      (<MapChoice/>),
      (<PlayerList/>)
    ];

    const columns = rawContents.map((elm, idx) => {
      return (
        <ControlBox pureClass="pure-u-1-2" key={`column.${idx}`}>
          {elm}
        </ControlBox>
      );
    });

    ReactDOM.render(
      (
        <div className="pure-g">
          {columns}
        </div>
      ), this.mainControls);
  }
  private get currentTrack() {
    return TrackList.default.tracks[this.trackIndex];
  }

  // private get columnIndex() {
  //   return Math.abs(this.currentColumnIndex) % this.columns.length;
  // }

  private get trackIndex() {
    return Math.abs(this.currentTrackIndex) % TrackList.default.tracks.length;
  }


  constructor(private mainControls: HTMLElement, private onNewGameRequest: () => void) {
    this.currentColumnIndex = 10000;
    this.currentTrackIndex = 10000 * TrackList.default.tracks.length;
    this.render();
  }

  public Hide = () => {
    this.mainControls.style.display = 'none';
  }
  public Show = () => {
    this.mainControls.style.display = 'display';
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
    // this.renderAll();
  }

  private handleChoose = () => {
    // console.log('column index', this.columnIndex);
    this.onNewGameRequest();
    // switch (this.columnIndex) {
    //   case 2:
    //     this.onNewGameRequest();
    //     break;
    //   default:
    //     this.handleUpDown(false);
    //     break;
    // }
  }

  private handleUpDown = (up: boolean) => {
    // switch (this.columnIndex) {
    //   case 0:
    //     // first column is track
    //     this.currentTrackIndex += up ? 1 : -1;
    //     break;
    // }
  }

  public HandlePlayerList = (players: Player[]) => {
    this.players = players;
    // this.renderAll();
  }

  // private renderAll = () => {
  //   this.renderSelectedColumn();
  //   this.renderTrackToMenu();
  //   this.renderPlayerList();
  // }

  // private renderSelectedColumn = () => {
  //   for (var i = 0; i < this.columns.length; i++) {
  //     if (i == this.columnIndex) {
  //       this.columns[i].classList.add('selected');
  //     } else {
  //       this.columns[i].classList.remove('selected');
  //     }
  //   }
  // }
  // private renderTrackToMenu = () => {
  //   this.trackName.innerText = this.currentTrack.name;
  // }
  // private renderPlayerList = () => {
  //   const html = (<any>R.pipe)(
  //     R.map((p: Player) => {
  //       return `
  //       <li style="background: #${p.Color.toString(16)}">
  //         ${p.DeviceId} - ${p.Nickname}
  //       </li>`;
  //     }),
  //     R.join('')
  //   )(this.players);
  //   // console.log('HTML', html);
  //   this.playerListElement.innerHTML = html;
  // }

}

export default MainMenu;