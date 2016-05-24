
/// <reference path="../../../typings/references.d.ts" />


import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as R from 'ramda';
import * as Promise from 'bluebird';

import Player from '../player';
import {Racer, RacerState} from './racer';
import TrackTools from './track.tools';
import PlacementTools from './placement.tools';
import RacerCommand from '../../interfaces/racercommand';
import * as WindowFrames from '../../interfaces/window.frame';
import Utility from '../../data/utility';

import RacerHUDs from './racer.huds.tsx';

import LoadingBoard from './loading.board.tsx';
import LeaderBoard from './leader.board.tsx';
import UnsupportedBoard from './unsupported.board.tsx';
import ReadySet from './ready.set.tsx';

export enum RaceState {
  Unsupported, // Cannot run the asset
  Loading, //loading assets
  Pending, // before race starts
  Counting, //Numbers being displayed
  Green, // Go flag
  Race, //race in progress
  ForcedLeaderboard, // ignore inputs to move past leaderboard (prevents spamming)
  Post // leaderboard
}
const availableSoundtracks = [
  "Trance.A.Metal.Rush.mp3",
  "Trance.B.Clunk.mp3",
  "Trance.C.Bright.Blip.mp3",
  "Trance.D.Base.Dance.mp3",
  "Trance.E.Frantic.Bomb.mp3",
  "Trance.F.Trade.Pep.mp3",
  "Trance.G.Dampen.mp3",
  "Trance.H.Jumper.mp3",
  "Trance.I.Pickitah.Motion.mp3",
  "Trance.J.Sweeper.mp3",
  "Trance.K.Space.Trance.mp3",
  "TranceI.L.Pickitah.Motion.mp3",
];



/** A Race controller
*/
export class Race {

  public get Racers() { return this.racers; }
  private get canvas() { return this._canvasElm; }
  private _canvasElm: HTMLCanvasElement;
  private racers: Racer[];
  private state: RaceState = RaceState.Loading;
  private trackTools: TrackTools;
  private placementTools: PlacementTools;

  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private assetsManager: BABYLON.AssetsManager;
  private kart: BABYLON.AbstractMesh;
  private flareTextures: BABYLON.Texture;

  private countDownSound: BABYLON.Sound;
  private goSound: BABYLON.Sound;
  private musicSound: BABYLON.Sound;

  private periodicUpdateId: any;
  private presentMilliseconds = 0;
  private static PERIODIC_UPDATE_MS = 50;
  private static id = 0;
  private id = Race.id++;

  private static PENDING_MS_PER_STATE = 1200;
  private static MS_STEP_TO_DROP5PER = 50;
  private static MS_TO_ALWAYS_HOLD_LEADERBOARD = 7500;
  private countDownRemaining = 4;

  private get ShouldShowHud() {
    return (
      this.state == RaceState.Counting ||
      this.state == RaceState.Green ||
      this.state == RaceState.Race ||
      this.state == RaceState.Pending
    );
  }
  private get ShouldShowLeaderBoard() {
    return (
      this.state == RaceState.Post ||
      this.state == RaceState.ForcedLeaderboard
    );
  }

  constructor(
    currentPlayers: Player[],
    private rootElement: HTMLElement,
    trackFileName: string,
    private lapsToWin = 3,
    private onRaceDone: () => void
  ) {
    this.racers = Racer.PlayersToRacers(currentPlayers, this.lapsToWin);
    this.render();
    this.loadLevel(trackFileName);
  }

  private render = () => {

    ReactDOM.render(
      (<div>
        <div className="controls">
          <canvas ref={ref => this._canvasElm = ref} className="render-canvas"></canvas>
        </div>

        {this.ShouldShowHud ? <RacerHUDs racers={this.racers} totalLaps={this.lapsToWin} /> : ''}

        {this.state == RaceState.Counting ? <ReadySet seconds={this.countDownRemaining} /> : ''}
        {this.state == RaceState.Green ? <ReadySet seconds={0} /> : ''}
        {this.ShouldShowLeaderBoard ? <LeaderBoard
          placements={this.placementTools ? this.placementTools.Placement : []}
          readyToLeave={this.state == RaceState.Post}/> : ''}
        {this.state == RaceState.Loading ? <LoadingBoard /> : ''}
        {this.state == RaceState.Unsupported ? <UnsupportedBoard /> : ''}
      </div>), this.rootElement);
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
      this.scene.workerCollisions = true;
      this.scene.executeWhenReady(this.babylonSceneLoaded);
    }, (progress) => {
      // To do: give progress feedback to user
      // console.log('progress', progress);
    });


    window.addEventListener(`resize.${this.id}`, this.babylonEngineResize);
  }

  private babylonSceneLoaded = () => {
    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);
    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin(true, 5));

    this.trackTools = new TrackTools(this.scene.meshes, this.scene);
    this.placementTools = new PlacementTools(this.racers, this.lapsToWin);

    // Assign physics objects their state
    this.scene.meshes.filter((m) => {
      return m.name.indexOf('static') > -1;
    }).forEach((m) => {
      // console.log(`Setting ${m.name} to ground`);
      m.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 20.5, restitution: 0 });
    });

    // hide invisible objects
    this.scene.meshes.filter((m) => {
      return m.name.indexOf('invisible') > -1;
    }).forEach((m) => {
      // console.log(`Setting ${m.name} invisible`);
      m.isVisible = false;
    });

    const currentSoundtrack = Utility.RandomItem(availableSoundtracks);

    this.assetsManager = new BABYLON.AssetsManager(this.scene);
    const kartTask = this.assetsManager.addMeshTask('ship', '', './assets/', 'kart.babylon');
    const flareTask = this.assetsManager.addTextureTask('flare', './images/flare.png');
    const countDownSoundTask = this.assetsManager.addBinaryFileTask('countdownsound', 'audio/load.wav');
    const goSoundTask = this.assetsManager.addBinaryFileTask('gosound', 'audio/DM-CGS-18.wav');
    const musicSoundTask = this.assetsManager.addBinaryFileTask('gosound', `audio/${currentSoundtrack}`);
    kartTask.onSuccess = (task: any) => {
      // console.log(task);
      const kart = task.loadedMeshes[0];
      this.scene.removeMesh(kart);
      this.kart = kart;
    }
    flareTask.onSuccess = (task: any) => {
      this.flareTextures = task.texture;
    }
    countDownSoundTask.onSuccess = (task: any) => {
      this.countDownSound = new BABYLON.Sound('chimesound', task.data, this.scene, null, { autoplay: false, loop: false });
    }
    goSoundTask.onSuccess = (task: any) => {
      this.goSound = new BABYLON.Sound('gosound', task.data, this.scene, null, { autoplay: false, loop: false });
    }
    musicSoundTask.onSuccess = (task: any) => {
      this.musicSound = new BABYLON.Sound('musicsound', task.data, this.scene, null, { autoplay: true, loop: true, volume: 0.65 });
    }
    this.assetsManager.onFinish = this.babylonAssetsLoaded;
    this.assetsManager.load();
  }

  private babylonAssetsLoaded = (tasks) => {
    const spawns = Race.spawnObjToSpawns(this.scene.getMeshByID('spawns'));

    this.Racers.forEach((r, idx) =>
      r.configureRacerInScene(
        this.scene,
        spawns[idx],
        this.kart,
        this.flareTextures,
        this.trackTools
      )
    );
    this.setupCameras(this.Racers.length);

    this.presentMilliseconds = +Date.now();
    this.engine.runRenderLoop(this.babylonEngineLoop);
    this.periodicUpdateId = setInterval(this.perodicUpdate, Race.PERIODIC_UPDATE_MS);

    // force camera position
    this.racers.forEach(r => r.onEveryFrame(1));
    this.state = RaceState.Pending;

    const countDown = () => {
      this.countDownRemaining--;
      this.countDownSound.play();
      if (this.countDownRemaining > 1) {
        this.state = RaceState.Counting;
        this.render();
        return Promise.delay(Race.PENDING_MS_PER_STATE).then(countDown);
      } else {
        return Promise.resolve();
      }
    }
    Promise.delay(Race.PENDING_MS_PER_STATE)
      .then(countDown)
      .delay(Race.PENDING_MS_PER_STATE)
      .then(() => {
        this.goSound.play();
        this.presentMilliseconds = +Date.now();
        this.state = RaceState.Green;
        this.racers.forEach(r => r.State = r.DeviceId == 65075 ? RacerState.AI : RacerState.Play);
        this.render();
      })
      .delay(Race.PENDING_MS_PER_STATE)
      .then(() => {
        this.state = RaceState.Race;
        this.render();
      })
  }

  private babylonEngineLoop = () => {
    const currentMilliseconds = +Date.now();
    this.racers.forEach(r => r.onEveryFrame(currentMilliseconds - this.presentMilliseconds));
    this.presentMilliseconds = currentMilliseconds;
    this.scene.render();
    this.render();

  }
  private babylonEngineResize = () => {
    this.engine.resize();
  }
  /** Expensive but less fps sensitive tasks */
  private perodicUpdate = () => {
    this.placementTools.UpdateRanks();
    this.racers.forEach(r => {
      r.Place = this.placementTools.CheckPosition(r);
    });
    if (R.all(R.prop('DoneWithRace'), this.racers)) {
      // Race Complete, open the placement screen
      console.log('EVERYONE done');
      this.state = RaceState.ForcedLeaderboard;
      this.render();
      window.clearTimeout(this.periodicUpdateId);
      Promise.delay(Race.MS_TO_ALWAYS_HOLD_LEADERBOARD).then(() => {
        this.state = RaceState.Post;
        this.render();
      })
    }
  }

  public UpdateRacerState = (device_id: number, racerCommand: RacerCommand) => {
    //find the racer
    const racer = R.find((r) => r.DeviceId == device_id, this.Racers);
    if (!racer) return;

    this.handleCommandInPost(device_id, racerCommand, racer);

    racer.UpdateRacerCommand(racerCommand);
  }

  private handleCommandInPost = (device_id: number, racerCommand: RacerCommand, racer: Racer) => {

    // if in post state and leader requests done, close board
    // or if a majority of the other players request it
    if (this.state != RaceState.Post) return;

    const allFalse = R.pipe(
      R.values,
      R.all(R.not)
    )(racerCommand);

    if (allFalse) return;

    console.log('header possible closing command', racerCommand, device_id);

    const isLeader = this.Racers[0].DeviceId == device_id;
    racer.SetToDone();
    const votedToClose =
      this.Racers.filter(r => r.State == RacerState.Done).length / this.Racers.length;
    console.log('Close vote of ', votedToClose);

    if (isLeader || votedToClose > 0.5) {
      this.closeLevel();
      return;
    }

  }


  private setupCameras = (count: number = this.Racers.length) => {
    this.racers.forEach((racer, index) => {
      racer.Camera.viewport = WindowFrames.WindowFrameToBABYLONViewport(WindowFrames.Frames[this.Racers.length - 1][index]);
    });
  }

  private closeLevel = () => {
    window.removeEventListener(`resize.${this.id}`, this.babylonEngineResize);
    this.engine.stopRenderLoop();
    this.musicSound.setVolume(0, 4);
    this.musicSound.stop(4.1);
    this.onRaceDone();
  }

  private shouldUpdateRacer = () => {
    return (this.state == RaceState.Race || this.state == RaceState.Green);
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

  /** If the Racer is finished in the race or not */
  public ShouldBeDone = (racer: Racer) => {

  }

}

export default Race;