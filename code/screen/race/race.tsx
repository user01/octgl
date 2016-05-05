
/// <reference path="../../../typings/references.d.ts" />


import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Player from '../player';
import Racer from './racer';

import OnePlayer from './huds/oneplayer.tsx';
import TwoPlayer from './huds/twoplayer.tsx';

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
  private racers: Racer[];
  private state: RaceState = RaceState.Loading;

  private engine: BABYLON.Engine;

  private static id = 0;
  private id = Race.id++;

  constructor(
    currentPlayers: Player[],
    private rootElement: HTMLElement,
    trackFileName: string,
    private onRaceDone: () => void
  ) {
    this.racers = Racer.PlayersToRacers(currentPlayers);
    this.render();
    this.loadLevel(trackFileName);
  }

  private render = () => {

    ReactDOM.render(
      (<div>
        <div className="controls">
          <canvas ref={ref => this._canvasElm = ref} className="render-canvas"></canvas>
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
      case 2:
        return (<TwoPlayer racers={this.racers} />)
      default:
        return (<span>Bad player length of {this.racers.length}</span>);
    }
  }

  private loadLevel = (filename) => {


    this.engine = new BABYLON.Engine(this.canvas, true);
    var sphere;

    // create a basic BJS Scene object
    var scene = new BABYLON.Scene(this.engine);

    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);

    // target the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);

    // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
    sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);

    // move the sphere upward 1/2 of its height
    sphere.position.y = 1;

    // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);

    this.engine.runRenderLoop(function () {
      sphere.position.y = Math.sin((new Date()).getMilliseconds() / 200);
      // sphere.position.y = 1;
      scene.render();
    });
    // engine.stopRenderLoop()
    window.addEventListener(`resize.${this.id}`, this.babylonEngineResize);
  }

  private babylonEngineLoop = () => {

  }
  private babylonEngineResize = () => {
    this.engine.resize();
  }

  private closeLevel = () => {
    window.removeEventListener(`resize.${this.id}`, this.babylonEngineResize);
    this.onRaceDone();
  }

}

export default Race;