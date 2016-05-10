
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';
import RacerCommand from '../../interfaces/racercommand';

import * as R from 'ramda';

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

  private linearVelocity: number = 0;

  /** Current direction of travel */
  private currentVelocityAroundY: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
  /** Angle around Y axis kart offset from the angle of the current velocity */
  private turnAngleRadians = 0;

  private static TURN_ANGLE_MAX_DIFF_FROM_VELOCITY = Math.PI / 3;
  private static FULL_X_TILT = Math.PI / 10;
  private static TURN_ANGLE_RADIANS_PER_SECOND = Math.PI / 4;
  private static IMPULSE_PER_SECOND = 5;
  private static MAX_LINEAR_VELOCITY = 5;
  private static DRAG_GROUND = 0.65;
  private static DRAG_FULL_TILT = 0.45;
  private static VELOCITY_FROM_DRAG_PER_SECOND = 5;


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


    const sphereMat = new BABYLON.StandardMaterial(`spheremat.${this.DeviceId}`, scene);
    sphereMat.diffuseColor = color;
    sphereMat.wireframe = true;
    this.roller = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 6, 2.5, scene);
    this.roller.material = sphereMat;
    this.roller.position = spawn;
    this.roller.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor,
      { mass: 5, friction: 8.5, restitution: 0.1 });

    this.pointerMesh = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 6, 0.5, scene);
    this.pointerMesh.material = sphereMat;
    this.pointerMesh.position = spawn;

    this.camera = new BABYLON.FreeCamera(`camera.${this.DeviceId}`, this.baseMesh.position.add(new BABYLON.Vector3(-20, 8, 0)), scene);
    this.camera.lockedTarget = this.baseMesh;

    scene.activeCameras.push(this.camera);

  }

  public onEveryFrame = (millisecondsSinceLastFrame: number) => {

    //#########################################################################
    // Starting Definitions
    //#########################################################################
    const fractionOfSecond = millisecondsSinceLastFrame / 1000;
    let impulseScalar = 1;
    millisecondsSinceLastFrame = Math.min(millisecondsSinceLastFrame, 100);


    //#########################################################################
    // Current Linear Velocity
    //#########################################################################
    const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    this.linearVelocity = linear.length();
    this.currentVelocityAroundY = this.linearVelocity > 0.05 ? Racer.removeYComponent(linear) : this.currentVelocityAroundY;
    const linearVelocityAngle = Racer.radiansBetweenVectors(this.currentVelocityAroundY);


    //#########################################################################
    // Handle Inputs
    //#########################################################################
    if (this.racerCommand.left && !this.racerCommand.right) {
      // turning left
      this.turnAngleRadians -= fractionOfSecond * Racer.TURN_ANGLE_RADIANS_PER_SECOND;
      impulseScalar = 0.8;
    } else if (!this.racerCommand.left && this.racerCommand.right) {
      // turning right
      this.turnAngleRadians += fractionOfSecond * Racer.TURN_ANGLE_RADIANS_PER_SECOND;
      impulseScalar = 0.8;
    } else {
      if (this.turnAngleRadians > linearVelocityAngle + 0.05) {
        this.turnAngleRadians -= fractionOfSecond * Racer.TURN_ANGLE_RADIANS_PER_SECOND;
      } else if (this.turnAngleRadians < linearVelocityAngle - 0.05) {
        this.turnAngleRadians -= fractionOfSecond * Racer.TURN_ANGLE_RADIANS_PER_SECOND;

      }
      if (this.racerCommand.left && this.racerCommand.right) {
        // reverse
        impulseScalar = -0.3;
      }
    }


    //#########################################################################
    // Bind Turn Angle
    //#########################################################################
    if (this.turnAngleRadians < linearVelocityAngle - Racer.TURN_ANGLE_MAX_DIFF_FROM_VELOCITY) {
      // too small, increase
      this.turnAngleRadians = linearVelocityAngle - Racer.TURN_ANGLE_MAX_DIFF_FROM_VELOCITY;
    } else if (this.turnAngleRadians > linearVelocityAngle + Racer.TURN_ANGLE_MAX_DIFF_FROM_VELOCITY) {
      // too large, decrease
      this.turnAngleRadians = linearVelocityAngle + Racer.TURN_ANGLE_MAX_DIFF_FROM_VELOCITY;
    }


    //#########################################################################
    // Set Car rotation around Y (direction) and X (tilt)
    //#########################################################################
    const fractionCarAngleSigned = ((linearVelocityAngle - this.turnAngleRadians) / Racer.TURN_ANGLE_MAX_DIFF_FROM_VELOCITY);
    this.kartMesh.rotation.y = this.turnAngleRadians;
    this.kartMesh.rotation.x = Racer.FULL_X_TILT * ((linearVelocityAngle - this.turnAngleRadians) / Racer.TURN_ANGLE_MAX_DIFF_FROM_VELOCITY);


    //#########################################################################
    // Compute Max Linear Velocity
    //#########################################################################
    // ground
    const dragGround = 1;

    // car angle
    const fractionCarAngleUnsigned = Math.abs(fractionCarAngleSigned); //0 means no drag, 1 means full
    const dragCarAngle = fractionCarAngleSigned * Racer.DRAG_FULL_TILT;

    // effects
    const dragEffects = 1;

    const allDragEffects = <number>R.reduce(R.multiply, 1, [dragGround, dragCarAngle, dragEffects]);
    // const currentMaxVelocity = allDragEffects * Racer.MAX_LINEAR_VELOCITY;


    //#########################################################################
    // Reduce Velocity
    //#########################################################################
    // always apply drag effects on the current linear motion
    const cappedVelocity = Math.min(this.linearVelocity, Racer.MAX_LINEAR_VELOCITY);
    const scaleFactor = (cappedVelocity - Racer.VELOCITY_FROM_DRAG_PER_SECOND * fractionOfSecond * (1 - allDragEffects)) / cappedVelocity;
    const linearVelocityReduced = linear.scale(scaleFactor);


    //#########################################################################
    // Apply Impulse
    //#########################################################################
    const impulseVector = Racer.rotateVector(
      BABYLON.Axis.X.scale(impulseScalar * Racer.IMPULSE_PER_SECOND * fractionOfSecond),
      this.turnAngleRadians,
      BABYLON.Axis.Y);
    this.roller.applyImpulse(impulseVector, this.roller.getAbsolutePosition());


    //#########################################################################
    // Configure Child Objects
    //#########################################################################
    const cameraVector = Racer.rotateVector(
      new BABYLON.Vector3(20, 8, 0),
      this.turnAngleRadians + Math.PI,
      BABYLON.Axis.Y);

    this.baseMesh.position = this.roller.position;
    this.camera.position = this.baseMesh.position.add(cameraVector);
    this.pointerMesh.position = this.baseMesh.position.add(linear);

    console.log('Drag ', allDragEffects);
    console.log('            Turn Angle', this.turnAngleRadians * 57.29);
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

  private static radiansBetweenVectors(v1: BABYLON.Vector3, v2: BABYLON.Vector3 = BABYLON.Axis.X): number {
    const mid = BABYLON.Vector3.Dot(v1, v2) / (v1.length() * v2.length());
    return Math.acos(mid);
  }

  private static removeYComponent(v: BABYLON.Vector3): BABYLON.Vector3 {
    return new BABYLON.Vector3(v.x, 0, v.z);
  }
}

export default Racer;