
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
  }

  public onEveryFrame = (delta: number) => {
    this.baseMesh.position = this.roller.position;
    this.Camera.alpha += Math.PI / 1024;
  }

  public static PlayersToRacers = (players: Player[]): Racer[] => {
    return players.map(player =>
      new Racer(player.Color, player.DeviceId, player.Nickname)
    );
  }
}

export default Racer;