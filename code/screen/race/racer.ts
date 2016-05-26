
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';
import TrackTools from './track.tools';
import RacerCommand from '../../interfaces/racercommand';
import Utility from '../../data/utility';


import * as Promise from 'bluebird';
import * as R from 'ramda';
import * as moment from 'moment';

export enum RacerState {
  Pending, // waiting for race to start
  Play, // human control
  AI, // AI control
  Post, // AI control after race has finished
  Derelict, //Player is declared broken
  Done, // Player has signaled to leave the placement list
}

enum RacerAiState {
  Left,
  Right,
  Straight
}

/** A Racer Player
 * Hold information on location, references to babylon objects
 * and current data on race
*/
export class Racer extends Player {
  public get LinearVelocity() { return this.linearVelocity; }
  public get Camera() { return this.camera; }
  public get IsGrounded() { return this.isGrounded; }
  private get cartYRotation() { return this.radiansForwardMain + this.radiansForwardTilt; }
  public get Lap() { return this.lap; }
  /** Hitbox set index for TrackTools to search for next hit */
  public get CurrentTrackIndex() { return this.currentTrackIndex; }
  public get TrackPosition() { return this.Lap + this.PercentDoneTrack / 100; }

  /** Placement in pack */
  public Place: number = 0;

  private lap: number = 1;
  public PercentDoneTrack = 0;
  private currentTrackIndex = 0;
  private isGrounded = false;
  private aiState = RacerAiState.Straight;
  public DEBUG_feedback = '';

  // Message flags
  public get ShowLapTime() { return this.showLapTime; }
  private showLapTime = false;
  public get LapTimeMessage() { return this.lapTimeMessage; }
  private lapTimeMessage = '??';

  public get ShowDerelictWarning() { return this.showDerelictWarning; }
  private showDerelictWarning = false;
  public get DerelictWarningMessage() { return this.DerelictWarningMessage; }
  private derelictWarningMessage = 'Continue the Race!';

  private trackTools: TrackTools;
  public get State() { return this.state; }
  public set State(newState: RacerState) {
    if (this.state == RacerState.Pending) {
      if (newState == RacerState.Play || newState == RacerState.AI) {
        this.timeStart = moment();
      }
    }
    this.state = newState;
  }
  private state = RacerState.Pending;
  private timeStart: moment.Moment;
  public get LapTimes() { return this.lapTimes; }
  private lapTimes: moment.Moment[] = [];
  public get LapDurations() { return this.lapDurations; }
  private lapDurations: moment.Duration[];
  public get TotalDuration() { return this.totalDuration; }
  private totalDuration: moment.Duration = moment.duration(0);

  private lastHitboxMs = +Date.now();

  private get isUnderAiControl() {
    return (
      this.state == RacerState.AI ||
      this.state == RacerState.Post
    );
  }
  public get DoneWithRace() {
    return (
      this.state == RacerState.Derelict ||
      this.state == RacerState.Done ||
      this.state == RacerState.Post
    );
  }
  public get FinishedRace() {
    return (
      this.state == RacerState.Done ||
      this.state == RacerState.Post
    );
  }
  public get ShouldMove() {
    return (
      this.state == RacerState.Play ||
      this.state == RacerState.AI ||
      this.state == RacerState.Done ||
      this.state == RacerState.Post
    );
  }
  public get IsDerelict() {
    return this.state == RacerState.Derelict;
  }

  private camera: BABYLON.FreeCamera;
  private roller: BABYLON.Mesh;
  private baseMesh: BABYLON.AbstractMesh;
  private pointerMesh: BABYLON.AbstractMesh;
  private kartMesh: BABYLON.AbstractMesh;
  private nextTarget: BABYLON.Vector3 = null;
  private cameraTarget: BABYLON.Vector3;

  private trailerParticleSystem: BABYLON.ParticleSystem;
  private groundParticleSystem: BABYLON.ParticleSystem;

  // private targetMesh: BABYLON.AbstractMesh;
  private tempSphere: BABYLON.AbstractMesh;
  private cameraTargetBox: BABYLON.AbstractMesh;

  // Message flags
  public get IsWrongWay() { return this.isWrongWay; }
  private isWrongWay = false;


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
  /** How far over the kart will tilt */
  private static FULL_X_TILT = Math.PI / 12;
  /** How quickly the kart can tilt away from the forward center */
  private static TURN_TILT_RADIANS_PER_SECOND = Math.PI / 6;
  /** How quickly the kart can turn the forward center */
  private static TURN_FORWARD_RADIANS_PER_SECOND = Math.PI / 4;
  /** Max angle the kart can turn from the next _path hitbox before the Wrong Way message */
  private static MAX_TURN_ANGLE = Math.PI * 0.6;

  /** Speed camera can move to reach ideal location */
  private static UNITS_PER_SECOND_CAMERA_SPEED = 0.5;

  /** Linear speeds */
  private static IMPULSE_PER_SECOND = 32;
  private static MAX_NORMAL_LINEAR_VELOCITY = 28;
  private static MAX_GROUND_LINEAR_VELOCITY = 10;

  /** Drag constants */
  private static DRAG_GROUND_PER_SECOND = Racer.IMPULSE_PER_SECOND * 0.08;
  private static DRAG_ROAD_PER_SECOND = Racer.IMPULSE_PER_SECOND * 0.02;
  private static DRAG_ZSLIDE_NO_TILT = Racer.IMPULSE_PER_SECOND * 0.75;
  private static DRAG_ZSLIDE_FULL_TILT = Racer.IMPULSE_PER_SECOND * 0.35;
  private static ZVELOCITY_INTO_X = 0.75;

  private static MS_BEFORE_DANGER_OF_DERELICT = 15000;
  private static MS_BEFORE_DERELICT = 30000;

  constructor(color: number,
    deviceId: number,
    Nickname: string = 'Unknown',
    private lapsToWin: number = 3
  ) {
    super(color, deviceId, Nickname);
  }

  public configureRacerInScene = (
    scene: BABYLON.Scene,
    spawn: BABYLON.Vector3,
    kart: BABYLON.AbstractMesh,
    flareTexture: BABYLON.Texture,
    trackTools: TrackTools
  ) => {
    this.trackTools = trackTools;

    const colors = Utility.NumberToColorSet(this.Color);
    const color = BABYLON.Color3.FromInts(colors.r, colors.g, colors.b);
    const color4 = BABYLON.Color4.FromInts(colors.r, colors.g, colors.b, 1);
    this.baseMesh = new BABYLON.AbstractMesh(`base.${this.DeviceId}`, scene);
    this.kartMesh = kart.clone(`kart.${this.DeviceId}`, this.baseMesh);
    const kartMat = new BABYLON.StandardMaterial(`kartmat.${this.DeviceId}`, scene);
    kartMat.diffuseColor = color;
    this.kartMesh.material = kartMat;


    const sphereMat = new BABYLON.StandardMaterial(`spheremat.${this.DeviceId}`, scene);
    sphereMat.diffuseColor = color;
    sphereMat.wireframe = true;
    this.roller = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 6, 5.5, scene);
    this.roller.material = sphereMat;
    this.roller.position = spawn;
    // this.roller.showBoundingBox = true;
    this.roller.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor,
      { mass: 5, friction: 8.5, restitution: 0.1 });
    this.roller.isVisible = false;

    this.pointerMesh = BABYLON.Mesh.CreateSphere(`roller.${this.DeviceId}`, 2, 0.5, scene);
    this.pointerMesh.material = sphereMat;
    this.pointerMesh.position = spawn;
    this.pointerMesh.isVisible = false;


    this.trailerParticleSystem = new BABYLON.ParticleSystem(`trailers.particles.${this.DeviceId}`, 2000, scene);
    this.trailerParticleSystem.particleTexture = flareTexture;
    this.trailerParticleSystem.emitter = this.roller;
    this.trailerParticleSystem.minEmitBox = new BABYLON.Vector3(0, 0, -0.5); // Starting all from
    this.trailerParticleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0.5); // To...
    this.trailerParticleSystem.minSize = 0.5;
    this.trailerParticleSystem.maxSize = 0.8;
    this.trailerParticleSystem.minLifeTime = 3.75;
    this.trailerParticleSystem.maxLifeTime = 5.25;
    this.trailerParticleSystem.emitRate = 150;
    this.trailerParticleSystem.color1 = color4;
    this.trailerParticleSystem.color2 = color4;
    this.trailerParticleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
    this.trailerParticleSystem.stop();


    const tempGroundWidth = 1.4;

    this.groundParticleSystem = new BABYLON.ParticleSystem(`ground.particles.${this.DeviceId}`, 200, scene);
    this.groundParticleSystem.particleTexture = flareTexture;
    this.groundParticleSystem.emitter = this.kartMesh;
    this.groundParticleSystem.minEmitBox = new BABYLON.Vector3(-tempGroundWidth + 6, -1.5, -tempGroundWidth); // Starting all from
    this.groundParticleSystem.maxEmitBox = new BABYLON.Vector3(tempGroundWidth + 6, -1.5 + tempGroundWidth / 2, tempGroundWidth); // To...
    this.groundParticleSystem.minSize = 0.8;
    this.groundParticleSystem.maxSize = 1.4;
    this.groundParticleSystem.minLifeTime = 0.05;
    this.groundParticleSystem.maxLifeTime = 0.15;
    this.groundParticleSystem.emitRate = 1250;
    this.groundParticleSystem.gravity = new BABYLON.Vector3(0, -2, 0);
    this.groundParticleSystem.color1 = new BABYLON.Color4(144 / 255, 9 / 255, 0 / 255, 1);
    this.groundParticleSystem.color2 = new BABYLON.Color4(144 / 255, 9 / 255, 0 / 255, 1);
    this.groundParticleSystem.colorDead = new BABYLON.Color4(144 / 255, 9 / 255, 0 / 255, 1);
    this.groundParticleSystem.stop();


    // this.targetMesh = BABYLON.Mesh.CreateBox(`something.${this.DeviceId}`, 8, scene);
    // this.targetMesh.material = sphereMat;

    // this.tempSphere = BABYLON.Mesh.CreateSphere(`tempish.${this.DeviceId}`, 6, 5.5, scene);
    // this.tempSphere.material = sphereMat;
    this.cameraTargetBox = BABYLON.Mesh.CreateBox(`cameraTargetBox.${this.DeviceId}`, 1.4, scene);
    this.cameraTargetBox.material = sphereMat;
    this.cameraTargetBox.isVisible = false;

    this.camera = new BABYLON.FreeCamera(`camera.${this.DeviceId}`, this.baseMesh.position.add(new BABYLON.Vector3(-20, 8, 0)), scene);
    this.camera.lockedTarget = this.cameraTargetBox;
    // this.camera.lockedTarget = this.pointerMesh;
    // this.camera.lockedTarget = this.baseMesh;

    this.forceNextTargetUpdate();

    scene.activeCameras.push(this.camera);
  }

  private updateTargetLocation = () => {
    // this.targetMesh.position = this.nextTarget;
  }

  public onEveryFrame = (millisecondsSinceLastFrame: number) => {
    // fraction of second since last frame, min of 1ms, max of 20fps, in decimal seconds
    const fractionOfSecond = R.pipe(
      R.max(1),
      R.min(Math.floor(1000 / 20)),
      R.flip(R.divide)(1000)
    )(millisecondsSinceLastFrame);

    //#########################################################################
    // Current Linear Velocity
    //#########################################################################
    const linearVelocity: BABYLON.Vector3 = (<any>this.roller.getPhysicsImpostor()).getLinearVelocity();
    this.linearVelocity = linearVelocity.length();
    // console.log(`Initial Linear ${linear.toString()}`);

    const impulseScalar = this.updateControls(fractionOfSecond);
    this.driveRacer(linearVelocity, fractionOfSecond, impulseScalar);
    this.updateChildObjects(linearVelocity, fractionOfSecond);
    this.updateTargetLocation();
    this.updateParticleSystems(linearVelocity.length());

    this.UpdateRacerPosition();
  }

  /** Preforms controls, either from player input or  */
  private updateControls = (fractionOfSecond: number) => {
    if (this.isUnderAiControl) {
      this.aiHandleControls();
    } else if (!this.ShouldMove) {
      return;
    }

    let impulseScalar = 1;
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

    return impulseScalar;
  }

  /** Handle current physic states to push the racer */
  private driveRacer = (linearVelocity: BABYLON.Vector3, fractionOfSecond: number, impulseScalar: number) => {
    if (!this.ShouldMove) {
      // force velocity to ignore everything but falling during pending
      (<any>this.roller.getPhysicsImpostor()).setLinearVelocity(new BABYLON.Vector3(0, 0, linearVelocity.z));
      return;
    }
    const impulseLength = impulseScalar * Racer.IMPULSE_PER_SECOND * fractionOfSecond;

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

    const cartXLinear = Racer.projectVectorOntoVector(linearVelocity, cartXAxis);
    const cartYLinear = Racer.projectVectorOntoVector(linearVelocity, cartYAxis);
    const cartZLinear = Racer.projectVectorOntoVector(linearVelocity, cartZAxis);

    // console.log(`cart X ${cartXLinear.toString()} Y ${cartYLinear.toString()} Z ${cartZLinear.toString()}`);

    const cartXLength = cartXLinear.length();
    const cartZLength = cartZLinear.length();

    let xDrag = 0;
    let zDrag = 0;

    // ground - drags both X and Z
    // check if on ground or not (road or air)
    xDrag += fractionOfSecond * (this.IsGrounded ? Racer.DRAG_GROUND_PER_SECOND : Racer.DRAG_ROAD_PER_SECOND);
    zDrag += fractionOfSecond * (this.IsGrounded ? Racer.DRAG_GROUND_PER_SECOND : Racer.DRAG_ROAD_PER_SECOND);

    // sliding - drags Z
    const zFract = Math.abs(this.radiansForwardTilt) / Racer.TURN_TILT_MAX;
    // this.temptemptemp = `${cartXLinear.toString()}`;

    zDrag += fractionOfSecond *
      (zFract * Racer.DRAG_ZSLIDE_FULL_TILT + (1 - zFract) * Racer.DRAG_ZSLIDE_NO_TILT);

    const newZSpeed = cartZLength - zDrag;

    // To emulate cars that can turn, transfer some of the burned motion while
    // tilting to push the car forward.
    // const zDragIntoXBoon = 0;
    // const zDragIntoXBoon = zDrag * Racer.ZVELOCITY_INTO_X;
    // const zDragIntoXBoon = zDrag * 0.25;
    const availableZSpeed = zDrag > cartZLength ? cartZLength : zDrag;

    // const zDragIntoXBoon = 0;
    const zDragIntoXBoon = availableZSpeed * Racer.ZVELOCITY_INTO_X;

    // this.DEBUG_feedback = `${Racer.roundPlace(xDrag, 2)} ${Racer.roundPlace(zDrag, 2)}`;
    // this.DEBUG_feedback = `${Racer.roundPlace(impulseLength, 2)} / ${Racer.roundPlace(xDrag, 2)} ${Racer.roundPlace(zDrag, 2)}`;
    // this.DEBUG_feedback = `${Racer.roundPlace(xDrag, 2)} ${Racer.roundPlace(zDragIntoXBoon, 2)}`;


    // this.temptemptemp = (`zDragIntoXBoon ${Racer.roundPlace(zDragIntoXBoon, 2)}`);
    // this.temptemptemp = (`${Racer.roundPlace(xDrag, 2)} ${Racer.roundPlace(zDrag, 2)} ${Racer.roundPlace(zDragIntoXBoon, 2)}`);

    // const newXSpeed = cartXLength - xDrag;
    const newXSpeed = cartXLength - xDrag + zDragIntoXBoon;

    const newXLinear = cartXLinear.scale(Math.max(0, newXSpeed / cartXLength));
    const newYLinear = cartYLinear.clone();
    const newZLinear = cartZLinear.scale(Math.max(0, newZSpeed / cartZLength));

    // console.log(`Linear Z drag ${zDrag} - ${Racer.roundPlace(cartZLength)} => ${Racer.roundPlace(newZLinear.length())}`);
    // console.log(`Linear Z ${Racer.roundPlace(newZLinear.length())} fraction ${Racer.roundPlace(Math.max(0, (cartZLength - zDrag) / cartZLength), 3)}`);
    // this.zLinear = Racer.roundPlace(Math.max(0, (cartZLength - zDrag) / cartZLength), 3);

    const newLinear = newXLinear.add(newYLinear).add(newZLinear);
    const newLinearLength = newLinear.length();

    //#########################################################################
    // Reduce Velocity based on state and maxes
    //#########################################################################
    const cappedVelocity = !this.IsGrounded ? Racer.MAX_NORMAL_LINEAR_VELOCITY : Racer.MAX_GROUND_LINEAR_VELOCITY;
    // const scaleFactor = newLinearLength > 0 ? Math.min(newLinearLength, cappedVelocity) / newLinearLength : 1;
    // // const scaleFactor = 1;
    // const linearVelocityReduced = newLinear.scale(scaleFactor);

    const linearVelocityReduced = newLinearLength <= cappedVelocity ?
      newLinear :
      Racer.adjustLengthByValue(newLinear, fractionOfSecond * 5 * -Racer.DRAG_GROUND_PER_SECOND);
    // if (newLinearLength > cappedVelocity) {
    //   // console.log('beyond capped, new ', newLinear.length(), ' reduced ', linearVelocityReduced.length());
    // }

    // this.DEBUG_feedback = `${Racer.roundPlace(cappedVelocity, 2)}`;
    // this.DEBUG_feedback = `${Racer.roundPlace(linearVelocityReduced.length(), 2)}`;
    // (<any>this.roller.getPhysicsImpostor()).setLinearVelocity(newLinear);
    (<any>this.roller.getPhysicsImpostor()).setLinearVelocity(linearVelocityReduced);


    //#########################################################################
    // Apply Impulse
    //#########################################################################
    const impulseVector = Racer.rotateVector(
      BABYLON.Axis.X.scale(impulseLength),
      this.cartYRotation,
      BABYLON.Axis.Y);
    this.roller.applyImpulse(impulseVector, this.roller.getAbsolutePosition());
    // console.log(`Linear ${linear.length()} and reduced ${linearVelocityReduced.length()}`)

  }

  //#########################################################################
  // Configure Child Objects
  //#########################################################################
  private updateChildObjects = (linearVelocity: BABYLON.Vector3, fractionOfSecond: number) => {
    const cameraVector = Racer.rotateVector(
      new BABYLON.Vector3(20, 8, 0),
      this.radiansForwardMain + 0.5 * this.radiansForwardTilt + Math.PI,
      BABYLON.Axis.Y);
    const idealCameraPosition = this.baseMesh.position.add(cameraVector);

    const forwardVector = Racer.rotateVector(
      new BABYLON.Vector3(6, -1, 0),
      this.radiansForwardMain + 0.5 * this.radiansForwardTilt,
      BABYLON.Axis.Y);
    const idealForwardPosition = this.baseMesh.position.add(forwardVector);

    this.cameraTargetBox.position = BABYLON.Vector3.Lerp(idealForwardPosition, this.pointerMesh.position, 0.1);

    const vectorToAddToBeIdeal = idealCameraPosition.subtract(this.camera.position)
    const vectorToAddToBeIdealLength = vectorToAddToBeIdeal.length();

    const cameraCloseToIdeal = vectorToAddToBeIdealLength < 0.005;
    this.camera.position = cameraCloseToIdeal ?
      idealCameraPosition :
      this.camera.position.add(vectorToAddToBeIdeal.scale(
        (Racer.UNITS_PER_SECOND_CAMERA_SPEED * fractionOfSecond + vectorToAddToBeIdealLength) / vectorToAddToBeIdealLength
      ))
    // BABYLON.Vector3.Lerp(this.camera.position, idealCameraPosition, 1 - 0.2);

    this.baseMesh.position = this.roller.position;
    this.pointerMesh.position = this.baseMesh.position.add(linearVelocity);
  }

  public UpdateRacerPosition = () => {
    const computedIndex = this.trackTools.NextTrackIndex(this.roller, this.currentTrackIndex, 5);
    // this.currentTrackIndex = this.trackTools.NextTrackIndex(this.roller, this.currentTrackIndex, 5);
    const newLap = this.trackTools.Lap(this.currentTrackIndex);
    if (this.lap != newLap && this.lap <= this.lapsToWin) { //finished a lap!
      this.lapTimes.push(moment());
      this.computeLapDurations();
      if (this.lap == this.lapsToWin) {
        // DONE
        console.log(`Device ${this.DeviceId} finished race!`);
        this.state = RacerState.Post;
      }

      this.computeTotalDuration();
      if (this.lastLapWasFastest()) {
        this.lapTimeMessage =
          Racer.RenderDurationAsLapTime(this.LapDurations[this.LapDurations.length - 1]);
        this.showLapTime = true;
        Promise.delay(2000).then(() => {
          this.showLapTime = false;
        });
      }
    }
    this.lap = newLap;
    this.PercentDoneTrack = this.trackTools.DistanceOnTrack(this.roller, this.currentTrackIndex) / this.trackTools.TrackLength;
    this.isGrounded = this.trackTools.IsOnGround(this.roller);
    // this.DEBUG_feedback = `Grounded: ${this.isGrounded}`;

    // if a new target has been found, 
    if (computedIndex != this.currentTrackIndex) {
      this.currentTrackIndex = computedIndex;
      this.lastHitboxMs = +Date.now();
      // recompute the target for AI use
      this.forceNextTargetUpdate();
    }

    const timestamp = +Date.now();
    if (timestamp - this.lastHitboxMs < Racer.MS_BEFORE_DANGER_OF_DERELICT) {
      this.showDerelictWarning = false;
    } else if (timestamp - this.lastHitboxMs < Racer.MS_BEFORE_DERELICT) {
      //in danger of derlicition
      this.showDerelictWarning = true;
    } else {
      //derilict
      this.state = RacerState.Derelict;
      this.showDerelictWarning = false;
    }

    const travelDirection = Racer.rotateVector(
      new BABYLON.Vector3(1, 0, 0),
      this.radiansForwardMain,
      BABYLON.Axis.Y);
    const vectorFromRollerToTarget = this.nextTarget.subtract(this.roller.position);
    const targetDirection = new BABYLON.Vector3(vectorFromRollerToTarget.x, 0, vectorFromRollerToTarget.z);
    const angleBetweenTargetAndDirection = Racer.radiansBetweenVectors(targetDirection, travelDirection);

    // this.tempSphere.position = this.roller.position.add(travelDirection.scale(10));
    // this.tempBox.position = this.roller.position.add(targetDirection.scale(10 / targetDirection.length()));

    this.isWrongWay = (angleBetweenTargetAndDirection > Racer.MAX_TURN_ANGLE);

    if (this.isUnderAiControl) {
      const newState = this.computeAiState(angleBetweenTargetAndDirection, targetDirection);
      if (this.aiState != newState) {
        this.aiState = newState;
        this.aiHandleControls(newState);
      }
    }
  }

  private computeAiState = (angleBetweenTargetAndDirection: number, cleanedVectorToNextTarget: BABYLON.Vector3) => {

    if (Math.abs(angleBetweenTargetAndDirection) < 0.1) {
      return RacerAiState.Straight;
    }
    const rightTurn = Racer.rotateVector(
      new BABYLON.Vector3(20, 0, 0),
      this.radiansForwardMain + angleBetweenTargetAndDirection,
      BABYLON.Axis.Y);
    const angleBetweenThisAndRightTurn = Racer.radiansBetweenVectors(rightTurn, cleanedVectorToNextTarget);
    const right = Math.abs(angleBetweenThisAndRightTurn) < 0.1;

    return right ? RacerAiState.Right : RacerAiState.Left;

  }

  private aiHandleControls = (state = this.aiState) => {
    // console.log('AI controls requested');
    switch (state) {
      case RacerAiState.Straight:
        this.racerCommand = {
          left: false,
          right: false,
          special: false
        };
        break;
      case RacerAiState.Left:
        this.racerCommand = {
          left: true,
          right: false,
          special: false
        };
        break;
      case RacerAiState.Right:
        this.racerCommand = {
          left: false,
          right: true,
          special: false
        };
        break;
      default:
        console.error('Bad AI state');
        break;
    }
  }

  private updateParticleSystems = (linearVelocity: number) => {
    // this.DEBUG_feedback = `${Racer.roundPlace(Racer.MAX_NORMAL_LINEAR_VELOCITY * 0.0001)} vs ${Racer.roundPlace(linearVelocity, 4)}`;
    if (linearVelocity > Racer.MAX_NORMAL_LINEAR_VELOCITY * 0.0001) {
      //fast enought
      if (!this.trailerParticleSystem.isStarted()) {
        // this.DEBUG_feedback = `ON`;
        this.trailerParticleSystem.start();
      }
    } else {
      if (this.trailerParticleSystem.isStarted()) {
        // this.DEBUG_feedback = `OFF`;
        this.trailerParticleSystem.stop();
      }
    }

    if (this.isGrounded) {
      // on turf
      if (!this.groundParticleSystem.isStarted()) {
        this.groundParticleSystem.start();
      }
    } else {
      if (this.groundParticleSystem.isStarted()) {
        this.groundParticleSystem.stop();
      }
    }
  }

  private computeLapDurations = () => {
    const times = R.concat([this.timeStart], this.lapTimes);
    const lapDurations = <any>R.pipe(
      R.aperture(2),
      R.map(
        ([start, end]: [moment.Moment, moment.Moment]) => {
          return moment.duration(end.diff(start));
        }))(times);
    return this.lapDurations = lapDurations;
  }

  private computeTotalDuration = (): moment.Duration => {
    if (this.lapTimes.length < 1) {
      return moment.duration(0);
    }
    const endTime = this.LapTimes.length > this.lapsToWin - 1 ?
      this.LapTimes[this.lapsToWin - 1] : R.last(this.LapTimes);
    return this.totalDuration = moment.duration(endTime.diff(this.timeStart));
  }

  private lastLapWasFastest = () => {
    if (this.LapDurations.length < 2) return false;
    const lastLapMs = R.last(this.LapDurations).asMilliseconds();
    const lastIsSmallest = R.pipe(
      R.init,
      R.all((duration: moment.Duration) => {
        return duration.asMilliseconds() > lastLapMs;
      })
    )(this.LapDurations);
    return lastIsSmallest;
  }

  private forceNextTargetUpdate = () => {
    return this.nextTarget = this.trackTools.GetNextTrackTarget(this.CurrentTrackIndex);
  }

  public UpdateRacerCommand = (racerCommand: RacerCommand) => {
    if (this.isUnderAiControl) return;
    this.racerCommand = racerCommand;
  }

  /** Sets this player's request closing the race */
  public SetToDone = () => {
    if (this.DoneWithRace) {
      this.state = RacerState.Done;
    }
  }

  public static PlayersToRacers = (players: Player[], lapsToWin: number): Racer[] => {
    return players.map(player =>
      new Racer(player.Color, player.DeviceId, player.Nickname, lapsToWin)
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

  /** Changes the length a certain delta */
  private static adjustLengthByValue(vector3: BABYLON.Vector3, delta: number) {
    const origLength = vector3.length();
    if (origLength < 0.0001) return vector3;
    const newLength = origLength + delta;
    const newScale = newLength / origLength;
    return vector3.scale(newScale);
  }

  private static roundPlace(num: number, places = 1) {
    const factor = Math.pow(10, places);
    return Math.floor(num * factor) / factor;
  }

  public static RenderDurationAsLapTime = (duration: moment.Duration) => {
    var str = '';

    if (duration.minutes() > 0) {
      str += `${duration.minutes()}:`;
    }
    const seconds = `${duration.seconds()}`;
    const pad = '00';
    str += pad.substring(0, pad.length - seconds.length) + seconds;


    const fractionalSeconds = `${Math.floor(duration.milliseconds() / 100)}`;

    str += '.' + fractionalSeconds;
    return str;
  }
}

export default Racer;