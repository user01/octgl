
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


    // // Attach camera to canvas inputs
    // newScene.activeCamera.attachControl(canvas);

    // // Once the scene is loaded, just register a render loop to render it
    // engine.runRenderLoop(function () {
    //   newScene.render();
    // });
    // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
    // engine.stopRenderLoop()
    window.addEventListener(`resize.${this.id}`, this.babylonEngineResize);
  }

  private babylonSceneLoaded = () => {

    // this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.OimoJSPlugin());
    this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());
    // this.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    // this.scene.workerCollisions = true;
    // this.scene.collisionsEnabled = true;

    var temp = {};

    this.scene.meshes.filter((m) => {
      return m.name.indexOf('static') > -1;
    }).map((m) => {
      console.log(m.name, m.position.toString());
      temp[m.name] = m.position.clone();
      m.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 2.5, restitution: 0 });
      // // m.checkCollisions = true;
      // // debugger;
      // // console.log('PRE ',m.name, oldPos.toString());
      // // console.log('PRE ',m.name, m.position.toString());
      // // // m.position = oldPos;
      // // console.log('PRE ',m.name, m.position.toString());
    });

    // this.scene.meshes.filter((m) => {
    //   return m.name.indexOf('ground') > -1;
    // }).map((m) => {
    //   console.log('grounding', m.name);
    //   // m.coll
    //   // m.checkCollisions = true;
    //   // m.setPhysicsState(BABYLON.PhysicsEngine.ConvexHullImpostor);
    //   // m.setPhysicsState(BABYLON.PhysicsEngine.HeightmapImpostor, { mass: 0, friction: 2.5, restitution: 0 });
    // });



    // this.scene.meshes.filter((m) => {
    //   return m.name.indexOf('_ACD') > -1;
    // }).map((m) => {
    //   console.log('grounding', m.name);
    //   // m.coll
    //   // m.checkCollisions = true;
    //   // m.setPhysicsState(BABYLON.PhysicsEngine.ConvexHullImpostor);
    //   // m.setPhysicsState(BABYLON.PhysicsEngine.ConvexHullImpostor, { mass: 0, friction: 2.5, restitution: 0 });
    //   m.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, friction: 2.5, restitution: 0 });
    // });

    // var g = BABYLON.Mesh.CreateGroundFromHeightMap()

    // // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
    // var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, this.scene);
    // ground.setPhysicsState(BABYLON.PhysicsEngine.PlaneImpostor, { mass: 0, friction: 0, restitution: 0.7 });
    // // ground.checkCollisions = true;

    // var box = BABYLON.Mesh.CreateBox("crate", 0.5, this.scene);
    // // box.material = new BABYLON.StandardMaterial("Mat", this.scene);
    // // box.material.diffuseTexture = new BABYLON.Texture("textures/crate.png", this.scene);
    // // box.material.diffuseTexture.hasAlpha = true;
    // box.position = new BABYLON.Vector3(0, 10, 0);
    // // box.checkCollisions = true;
    // // box.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    // console.log(box);
    // // box.apply
    // box.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 1, friction: 0.5, restitution: 0.5 });
    // // box.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 1, friction: 0.5, restitution: 0.5 });



    // var box = BABYLON.Mesh.CreateBox("crate", 0.5, this.scene);
    // box.position = new BABYLON.Vector3(0, 10, 0);
    // box.checkCollisions = true;
    // box.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    var box = BABYLON.Mesh.CreateBox("crate", 2.5, this.scene);
    box.position = new BABYLON.Vector3(0, 15, 0);
    box.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, { mass: 50, friction: 1.5, restitution: 0.1 });
    // box.checkCollisions = true;
    // box.ellipsoid = new BABYLON.Vector3(1, 1, 1);

    var me = this.scene.getMeshByID('HumanScale');
    // me.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 1.5, restitution: 0.1 });

    var camera01 = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 500, -500), this.scene);
    camera01.setTarget(new BABYLON.Vector3(0, 0, 0));
    // var camera02 = new BABYLON.FreeCamera('camera2', new BABYLON.Vector3(10, 5, -10), this.scene);
    // alpha rotates around y and beta rotates around x
    // var camera02 = new BABYLON.ArcFollowCamera('camera2', 0, Math.PI / 6, 8, box, this.scene);
    var camera02 = new BABYLON.ArcFollowCamera('camera2', 0, Math.PI / 6, 80, box, this.scene);
    // camera01.applyGravity

    this.scene.activeCameras.push(camera01);
    this.scene.activeCameras.push(camera02);

    camera01.viewport = new BABYLON.Viewport(0, 0, 0.5, 1);
    camera02.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1);

    // create a basic light, aiming 0,1,0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);

    camera01.attachControl(this.canvas);

    // target the camera to scene origin
    // camera01.app


    // // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
    // var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, this.scene);

    // move the sphere upward 1/2 of its height
    // sphere.position.y = 1;

    // camera02.setTarget(sphere.position);
    camera02.setTarget(BABYLON.Vector3.Zero());


    this.scene.beforeRender = () => {

    }
    var tempCount = 0;
    this.engine.runRenderLoop(() => {
      // sphere.position.y = Math.sin((new Date()).getMilliseconds() / 200);
      camera02.alpha += Math.PI / 512;
      // box.moveWithCollisions(new BABYLON.Vector3(0.05, 0, 0));
      // sphere.position.y = 1;

      if (tempCount == 30) {

        this.scene.meshes.filter((m) => {
          return m.name.indexOf('static') > -1;
        }).map((m) => {
          console.log('POST ', m.name, m.position.toString());
          // m.setPhysicsState(BABYLON.PhysicsEngine.MeshImpostor, { mass: 0, friction: 2.5, restitution: 0 });
          // m.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, { mass: 0, friction: 2.5, restitution: 0 });
          // m.position = temp[m.name];
        });
      }

      if (tempCount++ % 600 == 0) {

        this.scene.meshes.filter((m) => {
          return m.name.indexOf('static') > -1;
        }).map((m) => {
          console.log('POST ', m.name, m.position.toString());
          // m.position.copyFrom(temp[m.name]);
        });
      }


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