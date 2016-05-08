
/// <reference path="../../../typings/references.d.ts" />


import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Player from '../player';
import Racer from './racer';

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

  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;

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

    // this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.OimoJSPlugin());
    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    var temp = {};

    this.scene.meshes.filter((m) => {
      return m.name.indexOf('static') > -1;
    }).map((m) => {
      console.log(m.name, m.position.toString());
      m.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 2.5, restitution: 0 });
    });
    
    const spawns = this.scene.getMeshByID('spawns');
    const t = spawns.getVerticesData(BABYLON.VertexBuffer.NormalKind);
    for (var i=0;i<t.length;i++){
      let tt = t[i];
      
    }
    // .forEach(v=>{
      
    // })
    // spawns.subMeshes.forEach(m=>{
    //   console.log(`Spawns has ${m.verticesCount} vertices`);
    //   // m.getMesh().getVerticesData()
    // })
    

    const sphereMat = new BABYLON.StandardMaterial("spheremat", this.scene);
    sphereMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0);
    sphereMat.wireframe = true;
    var roller = BABYLON.Mesh.CreateSphere("roller", 6, 2.5, this.scene);
    roller.material = sphereMat;
    roller.position = new BABYLON.Vector3(0, 15, 0);
    roller.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 5, friction: 1.5, restitution: 0.1 });

    var camera01 = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 500, -500), this.scene);
    camera01.setTarget(new BABYLON.Vector3(0, 0, 0));
    var camera02 = new BABYLON.ArcFollowCamera('camera2', 0, Math.PI / 6, 25, roller, this.scene);

    this.scene.activeCameras.push(camera01);
    this.scene.activeCameras.push(camera02);

    camera01.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
    camera02.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);

    camera01.attachControl(this.canvas);
    camera02.setTarget(BABYLON.Vector3.Zero());

    window.addEventListener("keyup", (evt) => {
      console.log('Kick');
      roller.applyImpulse(new BABYLON.Vector3(10.5, 0, 0), roller.getAbsolutePosition());
    });


    this.scene.beforeRender = () => {

    }
    var tempCount = 0;
    this.engine.runRenderLoop(() => {
      camera02.alpha += Math.PI / 512;
      this.scene.render();
    });
  }
  private babylonEngineLoop = () => {

  }
  private babylonEngineResize = () => {
    this.engine.resize();
  }
  private setupCameras = (count: number) => {

  }

  private closeLevel = () => {
    window.removeEventListener(`resize.${this.id}`, this.babylonEngineResize);
    this.onRaceDone();
  }

}

export default Race;