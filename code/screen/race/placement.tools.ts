
/// <reference path="../../../typings/references.d.ts" />

import Racer from './racer';

import * as R from 'ramda';

/** Helper functions to determine a set of racer's positions
 * in the race
 */
export class PlacementTools {

  public get Placement() { return this.racersInOrder; }
  private racersInOrder: Racer[] = [];

  private standings: number[] = [];

  constructor(private racers: Racer[], private lapTotal = 3) {
    this.UpdateRanks();
  }

  public UpdateRanks = () => {
    const finishedRacers: Racer[] = R.pipe(R.filter(
      (r: Racer) => r.LapTimes.length > this.lapTotal
    ),
      R.sort((a: Racer, b: Racer) => {
        const aTime = a.LapTimes[this.lapTotal - 1];
        const bTime = b.LapTimes[this.lapTotal - 1];
        return aTime.diff(bTime);
      }),
      R.reverse

    )(this.racers);
    const currentRacers: Racer[] =
      R.pipe(
        R.filter(
          (r: Racer) => r.LapTimes.length <= this.lapTotal
        ),
        R.sort((a: Racer, b: Racer) => {
          return a.TrackPosition - b.TrackPosition;
        }),
        R.reverse
      )
        (this.racers);

    // console.log(`finished ${finishedRacers.length} : current ${currentRacers.length}`);

    this.racersInOrder = R.concat(finishedRacers, currentRacers);
    this.standings = R.map(R.prop('DeviceId'), this.racersInOrder);
  }

  public CheckPosition = (racer: Racer) => {
    return this.checkPosition(racer.DeviceId);
  }
  private checkPosition = (device_id: number) => {
    return R.findIndex(R.equals(device_id), this.standings) + 1;
  }
}

export default PlacementTools;