
/// <reference path="../../../typings/references.d.ts" />


import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as R from 'ramda';

import Player from '../player';
import Racer from './racer';
import TrackTools from './track.tools';
import RacerCommand from '../../interfaces/racercommand';

import OnePlayer from './huds/oneplayer.tsx';
import TwoPlayer from './huds/twoplayer.tsx';

import LoadingBoard from './loading.board.tsx';
import LeaderBoard from './leader.board.tsx';
import UnsupportedBoard from './unsupported.board.tsx';

export enum RaceState {
  Unsupported, // Cannot run the asset
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
  private trackTools: TrackTools;

  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private assetsManager: BABYLON.AssetsManager;
  private kart: BABYLON.AbstractMesh;

  private periodicUpdateId: any;
  private presentMilliseconds = 0;
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
        {this.state == RaceState.Unsupported ? <UnsupportedBoard /> : ''}
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
    if (!BABYLON.Engine.isSupported()) {
      this.state = RaceState.Unsupported;
      this.render();
      return;
    }

    this.engine = new BABYLON.Engine(this.canvas, true);

    BABYLON.SceneLoader.Load("assets/", filename, this.engine, (newScene) => {
      // Wait for textures and shaders to be ready
      this.scene = newScene;
      this.scene.executeWhenReady(this.babylonSceneLoaded);
    }, (progress) => {
      // To do: give progress feedback to user
      console.log('progress', progress);
    });


    window.addEventListener(`resize.${this.id}`, this.babylonEngineResize);
  }

  private babylonSceneLoaded = () => {
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    this.trackTools = new TrackTools(this.scene.meshes, this.scene);

    this.scene.meshes.filter((m) => {
      return m.name.indexOf('static') > -1;
    }).forEach((m) => {
      m.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 20.5, restitution: 0 });
    });

    this.assetsManager = new BABYLON.AssetsManager(this.scene);
    const kartTask = this.assetsManager.addMeshTask('ship', '', './assets/', 'kart.babylon');
    kartTask.onSuccess = (task: any) => {
      console.log(task);
      const kart = task.loadedMeshes[0];
      this.scene.removeMesh(kart);
      this.kart = kart;
    }
    this.assetsManager.onFinish = this.babylonAssetsLoaded;
    this.assetsManager.load();
  }

  private babylonAssetsLoaded = (tasks) => {
    console.log('Done loading');

    const spawns = Race.spawnObjToSpawns(this.scene.getMeshByID('spawns'));
    // console.log(spawns.map(v => v.toString()));

    this.Racers.forEach((r, idx) =>
      r.configureRacerInScene(
        this.scene,
        spawns[idx],
        this.kart
      )
    );
    this.setupCameras(this.Racers.length);

    this.presentMilliseconds = +Date.now();
    this.engine.runRenderLoop(this.babylonEngineLoop);
    this.periodicUpdateId = setInterval(this.perodicUpdate, 100);
    this.state = RaceState.Pending;
  }

  private babylonEngineLoop = () => {
    const currentMilliseconds = +Date.now();
    this.racers.forEach(r => r.onEveryFrame(currentMilliseconds - this.presentMilliseconds));
    this.presentMilliseconds = currentMilliseconds;
    this.scene.render();
  }
  private babylonEngineResize = () => {
    this.engine.resize();
  }
  /** Expensive but less fps sensitive tasks */
  private perodicUpdate = () => {
    this.updateRacersOnTrack();
    this.render();
  }

  public UpdateRacerState = (device_id: number, racerCommand: RacerCommand) => {
    const racer = R.find((r) => r.DeviceId == device_id, this.Racers);
    if (!racer) return;
    racer.UpdateRacerCommand(racerCommand);
  }

  private updateRacersOnTrack = () => {
    this.racers.forEach(r => r.UpdateRacerPosition(this.trackTools));
  }

  private setupCameras = (count: number = this.Racers.length) => {
    switch (count) {
      case 1:
        this.racers[0].Camera.viewport = new BABYLON.Viewport(0, 0, 1, 1);
        break;
      case 2:
        this.racers[0].Camera.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
        this.racers[1].Camera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1);
        break;
      case 3:
        this.racers[0].Camera.viewport = new BABYLON.Viewport(0, 0, 0.5, 0.5);
        this.racers[1].Camera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
        this.racers[2].Camera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1);
        break;
      case 4:
        this.racers[0].Camera.viewport = new BABYLON.Viewport(0, 0, 0.5, 0.5);
        this.racers[1].Camera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
        this.racers[2].Camera.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
        this.racers[3].Camera.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5);
        break;
    }
  }

  private closeLevel = () => {
    window.removeEventListener(`resize.${this.id}`, this.babylonEngineResize);
    window.clearTimeout(this.periodicUpdateId);
    this.onRaceDone();
  }

  private static spawnObjToSpawns = (spawns: BABYLON.AbstractMesh) => {
    if (!spawns) {
      console.warn('Track lacks a spawn object');
      return [];
    }
    spawns.isVisible = false;
    const rawVertexes = spawns.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const vertsAll: number[] = [];
    for (var i = 0; i < rawVertexes.length; i++) {
      let vertexValue = rawVertexes[i];
      vertsAll.push(rawVertexes[i]);
    }
    const groupByIndexed: any = R.groupBy;
    const vertsObj = R.addIndex(groupByIndexed)((elm, idx) => {
      return '' + Math.floor(idx / 3);
    }, vertsAll);
    const vertsGroups = R.values(vertsObj);

    return R.map(([x, y, z]) => {
      return new BABYLON.Vector3(
        x + spawns.position.x,
        y + spawns.position.y,
        z + spawns.position.z);
    }, vertsGroups);
  }

}

export default Race;