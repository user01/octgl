
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';
import RacerCommand from '../../interfaces/racercommand';

/** A Racer Player
 * Hold information on location, references to babylon objects
 * and current data on race
*/
export class Racer extends Player {
  public get LinearVelocity() { return this.linearVelocity; }
  public get Camera() { return this.camera; }

  private camera: BABYLON.FreeCamera;

  private roller: BABYLON.Mesh;
  private baseMesh: BABYLON.AbstractMesh;
  private pointerMesh: BABYLON.AbstractMesh;
  private kartMesh: BABYLON.AbstractMesh;

  private racerCommand: RacerCommand = {
    left: false,
    right: false,
    special: false
  };

  private linearHelper: BABYLON.LinesMesh;
  private linearVelocity: number = 0;

  /** Angle around Y axis kart is currently pointed (ie, where thrust is applied) */
  private turnAngleRadians = 0;
  private static TURN_ANGLE_RADIANS_PER_SECOND = Math.PI / 4;
  private static IMPULSE_PER_SECOND = 100;


  constructor(color: number,
    deviceId: number,
    Nickname: string = 'Unknown'
  ) {
    super(color, deviceId, Nickname);
  }

  public configureRacerInScene = (
    scene: BABYLON.Scene,
    spawn: BABYLON.Vector3,
    kart: BABYLON.AbstractMesh
  ) => {
    const color = BABYLON.Color3.FromHexString(`#${this.Color.toString(16)}`);
    this.baseMesh = new BABYLON.AbstractMesh(`base.${this.DeviceId}`, scene);
    this.kartMesh = kart.clone(`kart.${this.DeviceId}`, this.baseMesh);

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


    // window.addEventListener("keyup", (evt) => {
    //   console.log('Kick');
    //   const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    //   console.log(linear.length(), linear.toString());

    //   this.roller.applyImpulse(new BABYLON.Vector3(-10.5, 0, 0), this.roller.getAbsolutePosition());
    // });

    // const dir = new BABYLON.Vector3(1, 0, 0);
    // console.log(Racer.rotateVector(dir, Math.PI / 4));
    // console.log(Racer.rotateVector(dir, Math.PI / 2));
    // console.log(Racer.rotateVector(dir, Math.PI));

  }

  public onEveryFrame = (millisecondsSinceLastFrame: number) => {
    const fractionOfSecond = millisecondsSinceLastFrame / 1000;
    let impulseScalar = 1;
    if (this.racerCommand.left && !this.racerCommand.right) {
      // turning left
      this.turnAngleRadians -= fractionOfSecond * Racer.TURN_ANGLE_RADIANS_PER_SECOND;
      impulseScalar = 0.8;
    } else if (!this.racerCommand.left && this.racerCommand.right) {
      // turning right
      this.turnAngleRadians += fractionOfSecond * Racer.TURN_ANGLE_RADIANS_PER_SECOND;
      impulseScalar = 0.8;
    } else if (this.racerCommand.left && this.racerCommand.right) {
      // reverse
      impulseScalar = -0.3;
    }

    const impulseVector = Racer.rotateVector(
      new BABYLON.Vector3(1, 0, 0).scale(impulseScalar * Racer.IMPULSE_PER_SECOND * fractionOfSecond),
      this.turnAngleRadians,
      BABYLON.Axis.Y);
      
    const cameraVector = Racer.rotateVector(
      new BABYLON.Vector3(20, 8, 0),
      this.turnAngleRadians + Math.PI,
      BABYLON.Axis.Y);

    this.roller.applyImpulse(impulseVector, this.roller.getAbsolutePosition());

    const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    const movement = linear.lengthSquared() < 0.05 ? new BABYLON.Vector3(20, 0, 0) : linear;
    this.linearVelocity = linear.lengthSquared();

    this.kartMesh.rotation.y = this.turnAngleRadians;
    // this.kartMesh.rotation.y += Math.PI / 1024;
    // this.kartMesh.rotate(BABYLON.Axis.Y, Math.PI / 1024);

    // const flippedMovement = movement.multiplyByFloats(1, 0, 1).normalize().negate().scale(15).add(new BABYLON.Vector3(0, 6, 0));
    this.baseMesh.position = this.roller.position;
    this.camera.position = this.baseMesh.position.add(cameraVector);
    this.pointerMesh.position = this.baseMesh.position.add(linear);
    // this.pointerMesh.position = this.baseMesh.position.add(impulseVector);

    let scale = linear.lengthSquared() / 50;
    this.linearHelper.scaling = new BABYLON.Vector3(scale, scale, scale);
    this.linearHelper.lookAt(this.baseMesh.position.add(linear), 0, 0, 0);
  }

  public UpdateRacerCommand = (racerCommand: RacerCommand) => {
    this.racerCommand = racerCommand;
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