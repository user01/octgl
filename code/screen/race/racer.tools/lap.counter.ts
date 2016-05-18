
/// <reference path="../../../../typings/references.d.ts" />

import * as moment from 'moment';
import * as R from 'ramda';

/** 
 * Tracks the current laps
 */
export class LapCounter {

  public get Lap() { return this.lap; }
  public get LapTimes() { return this.lapTimes; }
  public get LapDurations() { return this.lapDurations; }
  public get TotalDuration() { return this.totalDuration; }
  public TimeStart: moment.Moment;
  public get FinishedLaps() {
    return this.lap >= this.lapsToWin;
  }

  private lap: number = 1;
  private lapTimes: moment.Moment[] = [];
  private lapDurations: moment.Duration[];
  private totalDuration: moment.Duration = moment.duration(0);

  constructor(private lapsToWin: number) {
  }

  public SetCurrentLap = (newLap: number) => {
    if (this.lap == newLap || this.lap >= this.lapsToWin) {
      return false;
    }

    //finished a lap!
    this.lapTimes.push(moment());
    this.computeLapDurations();
    this.computeTotalDuration();

    this.lap = newLap;
    return true;
  }

  private computeLapDurations = () => {
    const times = R.concat([this.TimeStart], this.lapTimes);
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
    return this.totalDuration = moment.duration(endTime.diff(this.TimeStart));
  }

  public LastLapWasFastest = () => {
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
}

export default LapCounter;