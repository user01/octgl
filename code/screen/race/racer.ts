
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';

/** A Racer Player
 * Hold information on location, references to babylon objects
 * and current data on race
*/
export class Racer extends Player {
  // public get DeviceId() { return this.device_id; }

  private roller: BABYLON.Mesh;

  public get Camera() { return this.camera; }
  private camera: BABYLON.ArcFollowCamera;
  private baseMesh: BABYLON.AbstractMesh;

  private linearHelper: BABYLON.LinesMesh;


  constructor(color: number,
    deviceId: number,
    Nickname: string = 'Unknown'
  ) {
    super(color, deviceId, Nickname);
  }

  public configureRacerInScene = (
    scene: BABYLON.Scene,
    spawn: BABYLON.Vector3
  ) => {
    this.baseMesh = new BABYLON.AbstractMesh(`base.${this.DeviceId}`, scene);

    this.linearHelper = BABYLON.Mesh.CreateLines("lines", [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, -10)
    ], scene);
    this.linearHelper.color = new BABYLON.Color3(0.8, 0, 0);
    this.linearHelper.parent = this.baseMesh;

    const sphereMat = new BABYLON.StandardMaterial(`spheremat.${this.DeviceId}`, scene);
    sphereMat.diffuseColor = BABYLON.Color3.FromHexString(`#${this.Color.toString(16)}`);
    sphereMat.wireframe = true;
    this.roller = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 6, 2.5, scene);
    this.roller.material = sphereMat;
    this.roller.position = spawn;
    this.roller.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor,
      { mass: 5, friction: 1.5, restitution: 0.1 });

    this.camera = new BABYLON.ArcFollowCamera('camera2', 0, Math.PI / 6, 25, this.roller, scene);

    scene.activeCameras.push(this.camera);


    window.addEventListener("keyup", (evt) => {
      console.log('Kick');
      this.roller.applyImpulse(new BABYLON.Vector3(10.5, 0, 0), this.roller.getAbsolutePosition());
    });



  }

  public onEveryFrame = (delta: number) => {
    this.baseMesh.position = this.roller.position;
    this.Camera.alpha += Math.PI / 1024;
    const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    console.log(linear.toString());

    let scale = linear.lengthSquared() / 50;
    this.linearHelper.scaling = new BABYLON.Vector3(scale,scale,scale);
    this.linearHelper.lookAt(this.baseMesh.position.add(linear), 0, 0, 0);
  }

  public static PlayersToRacers = (players: Player[]): Racer[] => {
    return players.map(player =>
      new Racer(player.Color, player.DeviceId, player.Nickname)
    );
  }
}

export default Racer;