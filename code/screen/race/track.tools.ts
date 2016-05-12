
/// <reference path="../../../typings/references.d.ts" />

import Player from '../player';
import RacerCommand from '../../interfaces/racercommand';

import * as R from 'ramda';

/** Helper functions to determine a racer's location on the track
 * 
 */
export class TrackTools {
  public get IndexLength() { return this.raceHitObjects.length; }
  public get TrackLength() { return this.totalDistance; }

  private raceHitObjects: BABYLON.AbstractMesh[][];
  private distances: number[] = [];
  private trackLengthAtIndexes: number[] = [];
  private totalDistance: number;

  private static pathRegExp = /^_path\.(\d+)/mi;

  constructor(
    sceneObjects: BABYLON.AbstractMesh[],
    scene: BABYLON.Scene
  ) {
    // R.pipe(
    //   R.map((mesh: BABYLON.AbstractMesh) => [mesh.name, TrackTools.pathRegExp.exec(mesh.name)]),
    //   R.forEach((a: any) => console.log(a[0], a[1]))
    //   // R.filter((mesh: BABYLON.AbstractMesh) => TrackTools.pathRegExp.test(mesh.name)),
    //   // R.forEach((mesh: BABYLON.AbstractMesh)=>console.log(mesh.name))
    // )(sceneObjects)

    this.raceHitObjects = R.pipe(
      R.filter((mesh: BABYLON.AbstractMesh) => TrackTools.pathRegExp.test(mesh.name)),
      R.sort((a: BABYLON.AbstractMesh, b: BABYLON.AbstractMesh) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;
        return 0;
      }),
      R.groupBy((mesh: BABYLON.AbstractMesh) => mesh.name),
      // R.groupBy((mesh: BABYLON.AbstractMesh) => TrackTools.pathRegExp.exec(mesh.name)[0]),
      R.values,
      R.filter((list: BABYLON.AbstractMesh[]) => list.length > 0)
    )(sceneObjects);
    console.log(this.raceHitObjects);

    const hitboxmat = new BABYLON.StandardMaterial(`hitboxmat`, scene);
    hitboxmat.diffuseColor = BABYLON.Color3.Magenta();
    hitboxmat.wireframe = true;
    R.forEach(R.forEach((m: BABYLON.AbstractMesh) => m.material = hitboxmat))(this.raceHitObjects);
    // R.forEach(R.forEach((m: BABYLON.AbstractMesh) => m.isVisible = false))(this.raceHitObjects);
    // R.forEach(R.forEach((m: any) => console.log(m.name)))(this.raceHitObjects);
    for (var i = 0; i < this.IndexLength; i++) {
      this.trackLengthAtIndexes.push(R.sum(this.distances));
      this.distances.push(R.head(this.getIndex(i)).position.subtract(R.head(this.getIndex(i + 1)).position).length());
    }
    this.totalDistance = R.sum(this.distances);
  }

  /** Computes the next hit index
   * Will look ahead rach number, just in case a hitbox was missed
  */
  public NextTrackIndex = (
    roller: BABYLON.AbstractMesh,
    currentTrackIndex: number,
    reach: number = 3
  ): number => {
    for (var index = currentTrackIndex; index < currentTrackIndex + reach; index++) {
      // console.log(`Testing for contact with ${index}`, this.getIndex(index));
      if (R.any(hitbox => hitbox.intersectsMesh(roller, true), this.getIndex(index))) {
        console.log(`Hit with index ${index}`);
        return index;
      }
    }
    return currentTrackIndex;
  }

  /** Distance APPROXIMATE on the track from the start */
  public DistanceOnTrack = (
    roller: BABYLON.AbstractMesh,
    currentTrackIndex: number
  ): number => {
    const distanceFromCurrentHitbox = R.head(this.getIndex(currentTrackIndex)).position.subtract(roller.position).length();
    return distanceFromCurrentHitbox + this.trackLengthAtIndexes[this.index(currentTrackIndex)];
  }

  /** Current Player Lap */
  public Lap = (currentTrackIndex: number): number => {
    if (currentTrackIndex < 0) return 1;
    return 1 + Math.floor(currentTrackIndex / this.IndexLength);
  }

  private getIndex = (index: number): BABYLON.AbstractMesh[] => {
    const actualIndex = this.index(index);
    return this.raceHitObjects[actualIndex];
  }

  private index = (index: number): number => {
    return index % this.IndexLength;
  }

}

export default TrackTools;