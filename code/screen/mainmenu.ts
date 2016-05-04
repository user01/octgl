
/// <reference path="../../typings/references.d.ts" />

import {MenuCommand, MenuCommands} from '../interfaces/menucommand';
import * as TrackList from '../data/track.list';
import Player from './player';
import * as R from 'ramda';

/** Controls selection of next track
 * Lists current player states
*/
export class MainMenu {
  private currentColumnIndex: number = 0;
  private currentTrackIndex: number = 0;

  private columns: NodeListOf<Element>;
  private trackName: HTMLHeadingElement;
  private imageElement: HTMLImageElement;
  private playerListElement: HTMLElement;

  private players: Player[] = [];

  public get CurrentGamePayload() {
    return {
      track: this.currentTrack
    };
  }

  private get currentTrack() {
    return TrackList.default.tracks[this.trackIndex];
  }

  private get columnIndex() {
    return Math.abs(this.currentColumnIndex % this.columns.length);
  }

  private get trackIndex() {
    return Math.abs(this.currentTrackIndex % TrackList.default.tracks.length);
  }


  constructor(private mainControls: HTMLElement, private onNewGameRequest: () => void) {
    this.columns = this.mainControls.getElementsByClassName('control-box');
    this.trackName = <HTMLHeadingElement>this.mainControls.getElementsByClassName('track-name')[0];
    this.playerListElement = <HTMLElement>this.mainControls.getElementsByClassName('player-list')[0];
    this.renderAll();
  }

  public HandleCommandFromLeader = (cmd: MenuCommand) => {
    console.log('cmd ', cmd);
    switch (cmd.cmd) {
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
    this.renderAll();
  }

  private handleChoose = () => {
    // console.log('column index', this.columnIndex);
    switch (this.columnIndex) {
      case 2:
        this.onNewGameRequest();
        break;
      default:
        this.handleUpDown(false);
        break;
    }
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
    this.renderAll();
  }

  private renderAll = () => {
    this.renderSelectedColumn();
    this.renderTrackToMenu();
    this.renderPlayerList();
  }

  private renderSelectedColumn = () => {
    for (var i = 0; i < this.columns.length; i++) {
      if (i == this.columnIndex) {
        this.columns[i].classList.add('selected');
      } else {
        this.columns[i].classList.remove('selected');
      }
    }
  }
  private renderTrackToMenu = () => {
    this.trackName.innerText = this.currentTrack.name;
  }
  private renderPlayerList = () => {
    const html = (<any>R.pipe)(
      R.map((p: Player) => {
        return `
        <li style="background: #${p.Color.toString(16)}">
          ${p.DeviceId} - ${p.Nickname}
        </li>`;
      }),
      R.join('')
    )(this.players);
    console.log('HTML', html);
    this.playerListElement.innerHTML = html;
  }

}

export default MainMenu;