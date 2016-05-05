
/// <reference path="../../../typings/references.d.ts" />


import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Player from '../player';
import Racer from './racer';

import OnePlayer from './huds/oneplayer.tsx';

import LoadingBoard from './loading.board.tsx';
import LeaderBoard from './leader.board.tsx';

export enum RaceState {
  Loading, //loading assets
  Pending, // before race starts
  Red, //red flag
  Yellow, //yellow flag
  Race, //race in progress
  Post // leaderboard
}

/** A Race controller
*/
export class Race {

  public get Racers() { return this.racers; }
  private get canvas() { return this._canvasElm; }
  private _canvasElm: HTMLCanvasElement;
  private racers: Racer[] = [];
  private state: RaceState = RaceState.Loading;

  constructor(
    currentPlayers: Player[],
    private rootElement: HTMLElement,
    private trackFileName: string
  ) {
    // load the current level assets

  }

  private render = () => {

    ReactDOM.render(
      (<div>
        <div className="controls">
          <canvas ref={ref => this._canvasElm = ref}></canvas>
        </div>

        {this.selectPlayerHud() }

        {this.state == RaceState.Post ? <LeaderBoard /> : ''}
        {this.state == RaceState.Loading ? <LoadingBoard /> : ''}
      </div>), this.rootElement);
  }

  private selectPlayerHud = () => {
    switch (this.racers.length) {
      case 1:
        return (<OnePlayer racers={this.racers} />)
      default:
        return (<span>Bad player length of {this.racers.length}</span>);
    }
  }

}

export default Race;