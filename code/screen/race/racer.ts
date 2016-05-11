
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
  private get cartYRotation() { return this.radiansForwardMain + this.radiansForwardTilt; }
  public zLinear:number=0

  private camera: BABYLON.FreeCamera;

  private roller: BABYLON.Mesh;
  private baseMesh: BABYLON.AbstractMesh;
  private pointerMesh: BABYLON.AbstractMesh;
  private kartMesh: BABYLON.AbstractMesh;

  private xMesh: BABYLON.AbstractMesh;
  private yMesh: BABYLON.AbstractMesh;
  private zMesh: BABYLON.AbstractMesh;

  private racerCommand: RacerCommand = {
    left: false,
    right: false,
    special: false
  };

  private linearVelocity: number = 0;

  /** Current direction of travel */
  // private currentVelocityAroundY: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
  /** Current Forward angle around Y */
  private radiansForwardMain = 0;
  /** Angle around Y axis kart offset from the angle of the current velocity */
  private radiansForwardTilt = 0;

  /** Constants for angles */
  /** Farthest from actual turn direction allowed */
  private static TURN_TILT_MAX = Math.PI / 10;
  private static FULL_X_TILT = Math.PI / 10;
  private static TURN_TILT_RADIANS_PER_SECOND = Math.PI / 3;
  private static TURN_FORWARD_RADIANS_PER_SECOND = Math.PI / 4;

  /** Linear speeds */
  private static IMPULSE_PER_SECOND = 14;
  private static MAX_NORMAL_LINEAR_VELOCITY = 8;
  private static MAX_GROUND_LINEAR_VELOCITY = 5;

  /** Drag constants */
  private static DRAG_GROUND_PER_SECOND = 0.3;
  private static DRAG_ROAD_PER_SECOND = 0.1;
  private static DRAG_ZSLIDE_FULL_TILT = 4.8;


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

    this.xMesh = BABYLON.Mesh.CreateBox(`xMesh.${this.DeviceId}`, 0.5, scene);
    this.xMesh.position = spawn;
    this.yMesh = BABYLON.Mesh.CreateBox(`yMesh.${this.DeviceId}`, 0.5, scene);
    this.yMesh.position = spawn;
    this.zMesh = BABYLON.Mesh.CreateBox(`zMesh.${this.DeviceId}`, 0.5, scene);
    this.zMesh.position = spawn;

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
    millisecondsSinceLastFrame = R.pipe(
      R.max(1),
      R.min(100)
    )(millisecondsSinceLastFrame);


    //#########################################################################
    // Current Linear Velocity
    //#########################################################################
    const linear: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    this.linearVelocity = linear.length();
    // console.log(`Initial Linear ${linear.toString()}`);
    if (R.identical(NaN, this.linearVelocity)) {
      console.warn('NAN linear vel');
      this.linearVelocity = 0;
      return;
    }
    // this.currentVelocityAroundY = this.linearVelocity > 0.05 ? Racer.removeYComponent(linear) : this.currentVelocityAroundY;
    // const linearVelocityAngle = Racer.radiansBetweenVectors(this.currentVelocityAroundY);


    //#########################################################################
    // Handle Inputs
    //#########################################################################
    if (this.racerCommand.left && !this.racerCommand.right) {
      // turning left
      this.radiansForwardTilt -= fractionOfSecond * Racer.TURN_TILT_RADIANS_PER_SECOND;
      this.radiansForwardMain -= fractionOfSecond * Racer.TURN_FORWARD_RADIANS_PER_SECOND;
      impulseScalar = 0.8;
    } else if (!this.racerCommand.left && this.racerCommand.right) {
      // turning right
      this.radiansForwardTilt += fractionOfSecond * Racer.TURN_TILT_RADIANS_PER_SECOND;
      this.radiansForwardMain += fractionOfSecond * Racer.TURN_FORWARD_RADIANS_PER_SECOND;
      impulseScalar = 0.8;
    } else {
      // push tilt back towards zero
      // console.log('tilt', this.radiansForwardTilt);
      if (this.radiansForwardTilt > 0.001) {
        this.radiansForwardTilt -= fractionOfSecond * Racer.TURN_TILT_RADIANS_PER_SECOND;
        this.radiansForwardTilt = this.radiansForwardTilt < 0 ? 0 : this.radiansForwardTilt;
      } else if (this.radiansForwardTilt < 0.001) {
        this.radiansForwardTilt += fractionOfSecond * Racer.TURN_TILT_RADIANS_PER_SECOND;
        this.radiansForwardTilt = this.radiansForwardTilt > 0 ? 0 : this.radiansForwardTilt;
      }
      if (this.racerCommand.left && this.racerCommand.right) {
        // reverse
        impulseScalar = -0.3;
      }
    }
    // console.log(`Impulse Scalar ${impulseScalar}`);


    //#########################################################################
    // Bind Turn Angle
    //#########################################################################
    if (this.radiansForwardTilt < -Racer.TURN_TILT_MAX) {
      // too small, increase
      this.radiansForwardTilt = -Racer.TURN_TILT_MAX;
    } else if (this.radiansForwardTilt > Racer.TURN_TILT_MAX) {
      // too large, decrease
      this.radiansForwardTilt = Racer.TURN_TILT_MAX;
    }
    // console.log(`Tilt ${this.radiansForwardTilt}`);


    //#########################################################################
    // Set Car rotation around Y (direction) and X (tilt)
    //#########################################################################
    const fractionCarAngleSigned = this.radiansForwardTilt / Racer.TURN_TILT_MAX;
    this.kartMesh.rotation.y = this.cartYRotation;
    this.kartMesh.rotation.x = Racer.FULL_X_TILT * fractionCarAngleSigned;


    //#########################################################################
    // Compute Max Linear Velocity
    //#########################################################################
    const cartXAxis = Racer.rotateVector(
      BABYLON.Axis.X,
      this.cartYRotation,
      BABYLON.Axis.Y);
    const cartZAxis = Racer.rotateVector(
      BABYLON.Axis.Z,
      this.cartYRotation,
      BABYLON.Axis.Y);
    const cartYAxis = BABYLON.Axis.Y.clone();

    const cartXLinear = Racer.projectVectorOntoVector(linear, cartXAxis);
    const cartYLinear = Racer.projectVectorOntoVector(linear, cartYAxis);
    const cartZLinear = Racer.projectVectorOntoVector(linear, cartZAxis);

    // console.log(`cart X ${cartXLinear.toString()} Y ${cartYLinear.toString()} Z ${cartZLinear.toString()}`);

    const cartXLength = cartXLinear.length();
    const cartZLength = cartZLinear.length();

    let xDrag = 0;
    let zDrag = 0;

    // ground - drags both X and Z
    // check if on ground or not (road or air)
    xDrag += fractionOfSecond * Racer.DRAG_ROAD_PER_SECOND;
    zDrag += fractionOfSecond * Racer.DRAG_ROAD_PER_SECOND;

    // sliding - drags Z
    zDrag += fractionOfSecond * Racer.DRAG_ZSLIDE_FULL_TILT;

    // console.log(`Xdrag ${xDrag} ZDrag ${zDrag}`);

    const newXLinear = cartXLinear.scale(Math.max(0, (cartXLength - xDrag) / cartXLength));
    const newYLinear = cartYLinear.clone();
    const newZLinear = cartZLinear.scale(Math.max(0, (cartZLength - zDrag) / cartZLength));

    // console.log(`Linear Z drag ${zDrag} - ${Racer.roundPlace(cartZLength)} => ${Racer.roundPlace(newZLinear.length())}`);
    console.log(`Linear Z ${Racer.roundPlace(newZLinear.length())} fraction ${Racer.roundPlace(Math.max(0, (cartZLength - zDrag) / cartZLength), 3)}`);
    this.zLinear = Racer.roundPlace(Math.max(0, (cartZLength - zDrag) / cartZLength), 3);

    const newLinear = newXLinear.add(newYLinear).add(newZLinear);
    const newLinearLength = newLinear.length();

    //#########################################################################
    // Reduce Velocity based on state and maxes
    //#########################################################################
    const cappedVelocity = true ? Racer.MAX_NORMAL_LINEAR_VELOCITY : Racer.MAX_GROUND_LINEAR_VELOCITY;
    const scaleFactor = newLinearLength > 0 ? Math.min(newLinearLength, cappedVelocity) / newLinearLength : 1;
    const linearVelocityReduced = newLinear.scale(scaleFactor);
    (<any>this.roller.getPhysicsImpostor()).setLinearVelocity(linearVelocityReduced);


    //#########################################################################
    // Apply Impulse
    //#########################################################################
    const impulseVector = Racer.rotateVector(
      BABYLON.Axis.X.scale(impulseScalar * Racer.IMPULSE_PER_SECOND * fractionOfSecond),
      this.cartYRotation,
      BABYLON.Axis.Y);
    this.roller.applyImpulse(impulseVector, this.roller.getAbsolutePosition());
    // console.log(`Linear ${linear.length()} and reduced ${linearVelocityReduced.length()}`)


    //#########################################################################
    // Configure Child Objects
    //#########################################################################
    const cameraVector = Racer.rotateVector(
      new BABYLON.Vector3(20, 8, 0),
      this.radiansForwardMain + 0.5 * this.radiansForwardTilt + Math.PI,
      BABYLON.Axis.Y);

    this.baseMesh.position = this.roller.position;
    this.camera.position = this.baseMesh.position.add(cameraVector);
    this.pointerMesh.position = this.baseMesh.position.add(linear);

    this.xMesh.position = this.baseMesh.position.add(cartXAxis.scale(10));
    this.yMesh.position = this.baseMesh.position.add(cartYAxis.scale(5));
    this.zMesh.position = this.baseMesh.position.add(cartZAxis.scale(5));

    // console.log('Drag ', allDragEffects);
    // console.log('            Turn Angle', this.turnAngleRadians * 57.29);
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

  private static projectVectorOntoVector(root: BABYLON.Vector3, axis = BABYLON.Axis.X) {
    const factor = BABYLON.Vector3.Dot(root, axis) / axis.lengthSquared();
    return axis.scale(factor);
  }

  private static roundPlace(num: number, places = 1) {
    const factor = Math.pow(10, places);
    return Math.floor(num * factor) / factor;
  }
}

export default Racer;