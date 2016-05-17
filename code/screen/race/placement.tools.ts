
/// <reference path="../../../typings/references.d.ts" />

import Racer from './racer';

import * as R from 'ramda';

/** Helper functions to determine a set of racer's positions
 * in the race
 */
export class PlacementTools {

  public get Placement() { return this.racersInOrder; }
  private racersInOrder: Racer[];

  private standings: number[];

  constructor(private racers: Racer[], private lapTotal = 3) {
    this.UpdateRanks();
  }

  public UpdateRanks = () => {
    const finishedRacers: Racer[] = R.pipe(R.filter(

      R.both(
        R.pipe(
          R.prop('TrackPosition'),
          R.flip(R.gte(this.lapTotal))
        ),
        r => r.length > 0
      )
    ),
      R.sort((a: Racer, b: Racer) => {
        return a.LapTimes[this.lapTotal - 1].diff(b.LapTimes[this.lapTotal - 1]);
      }),
      R.reverse

    )(this.racers);
    const currentRacers: Racer[] =
      R.pipe(
        R.filter(
          R.pipe(
            R.prop('TrackPosition'),
            R.flip(R.lt(this.lapTotal))
          )),
        R.sort((a: Racer, b: Racer) => {
          return a.TrackPosition - b.TrackPosition;
        }),
        R.reverse
      )
        (this.racers);

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