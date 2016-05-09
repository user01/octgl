
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';

/** A Racer Player
 * Hold information on location, references to babylon objects
 * and current data on race
*/
export class Racer extends Player {
  public get LinearVelocity() { return this.linearVelocity; }

  private roller: BABYLON.Mesh;

  public get Camera() { return this.camera; }
  // private camera: BABYLON.ArcFollowCamera;
  private camera: BABYLON.FreeCamera;
  private baseMesh: BABYLON.AbstractMesh;
  private pointerMesh: BABYLON.AbstractMesh;

  private linearHelper: BABYLON.LinesMesh;
  private linearVelocity: number = 0;


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
    const color = BABYLON.Color3.FromHexString(`#${this.Color.toString(16)}`);
    this.baseMesh = new BABYLON.AbstractMesh(`base.${this.DeviceId}`, scene);

    this.linearHelper = BABYLON.Mesh.CreateLines("lines", [
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, -10)
    ], scene);
    this.linearHelper.color = color;
    this.linearHelper.parent = this.baseMesh;

    const sphereMat = new BABYLON.StandardMaterial(`spheremat.${this.DeviceId}`, scene);
    sphereMat.diffuseColor = color;
    sphereMat.wireframe = true;
    this.roller = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 6, 2.5, scene);
    this.roller.material = sphereMat;
    this.roller.position = spawn;
    this.roller.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor,
      { mass: 5, friction: 1.5, restitution: 0.1 });

    this.pointerMesh = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 6, 0.5, scene);
    this.pointerMesh.material = sphereMat;
    this.pointerMesh.position = spawn;

    // this.camera = new BABYLON.ArcFollowCamera(`camera.${this.DeviceId}`, Math.PI, Math.PI / 6, 25, this.roller, scene);
    this.camera = new BABYLON.FreeCamera(`camera.${this.DeviceId}`, this.baseMesh.position.add(new BABYLON.Vector3(-20, 8, 0)), scene);
    this.camera.lockedTarget = this.baseMesh;
    // this.camera.parent = this.baseMesh;

    scene.activeCameras.push(this.camera);


    window.addEventListener("keyup", (evt) => {
      console.log('Kick');
      const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
      console.log(linear.length(), linear.toString());

      this.roller.applyImpulse(new BABYLON.Vector3(10.5, 0, 0), this.roller.getAbsolutePosition());
    });

    const dir = new BABYLON.Vector3(1, 0, 0);
    console.log(Racer.rotateVector(dir, Math.PI / 4));
    console.log(Racer.rotateVector(dir, Math.PI / 2));
    console.log(Racer.rotateVector(dir, Math.PI));

  }

  public onEveryFrame = (millisecondsSinceLastFrame: number) => {
    // console.log(millisecondsSinceLastFrame);
    const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    const movement = linear.lengthSquared() < 0.05 ? new BABYLON.Vector3(20, 0, 0) : linear;
    this.linearVelocity = linear.lengthSquared();

    const flippedMovement = movement.multiplyByFloats(1, 0, 1).normalize().negate().scale(15).add(new BABYLON.Vector3(0, 6, 0));
    this.baseMesh.position = this.roller.position;
    // this.camera.position = this.baseMesh.position.add(new BABYLON.Vector3(-20, 8, 0));
    this.camera.position = this.baseMesh.position.add(flippedMovement);
    this.pointerMesh.position = this.baseMesh.position.add(linear);
    // this.Camera.alpha += Math.PI / 1024;
    // this.Camera.alpha = 1;
    // console.log(linear.toString());

    let scale = linear.lengthSquared() / 50;
    this.linearHelper.scaling = new BABYLON.Vector3(scale, scale, scale);
    this.linearHelper.lookAt(this.baseMesh.position.add(linear), 0, 0, 0);
  }

  public static PlayersToRacers = (players: Player[]): Racer[] => {
    return players.map(player =>
      new Racer(player.Color, player.DeviceId, player.Nickname)
    );
  }


  private static rotateVector(vect: BABYLON.Vector3, radians = Math.PI / 2, rotAxis = BABYLON.Axis.Y) {
    const matrix = BABYLON.Matrix.RotationAxis(rotAxis, radians);
    return BABYLON.Vector3.TransformCoordinates(vect, matrix);
  }
}

export default Racer;