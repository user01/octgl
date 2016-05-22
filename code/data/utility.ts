
/// <reference path="../../typings/references.d.ts" />
import * as R from 'ramda';

/** A Utility Class
*/
export class Utility {
  public static NodeListToArray = <T extends Node>(nodeList: NodeListOf<T>) => {
    var array: Array<T> = [];
    for (var i = 0; i < nodeList.length; i++) {
      array.push(nodeList.item(i));
    }
    return array;
  }

  public static NumberToColor(num) {
    const {r, g, b} = Utility.NumberToColorSet(num);
    return "rgb(" + [r, g, b].join(",") + ")";
  }

  public static NumberToColorSet(num) {
    num >>>= 0;
    var b = num & 0xFF,
      g = (num & 0xFF00) >>> 8,
      r = (num & 0xFF0000) >>> 16;
    return { r, g, b };
  }

  public static RandomItem<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
  }
}

export class MessageLimiter {
  private pastMessages: number[] = []
  private periodicUpdateId: any = -1;
  private static PERIODIC_UPDATE_MS = 200;

  private get messagesInLastSecond() { return this.pastMessages.length; }

  constructor(
    private limitPerSecond: number,
    private realMessage: (device_id: number, message: any) => void
  ) {
  }

  public Message = (device_id: number, message: any) => {
    this.purgeOldMessages();
    this.enableSendingMessages();
    if (this.messagesInLastSecond < this.limitPerSecond - 1) {
      this.send(device_id, message);
    } else {
      //queue up data
    }
  }

  private send = (device_id: number, message: any) => {
    this.pastMessages.push(this.Now);
    this.realMessage(device_id, message);
  }

  private enableSendingMessages = () => {
    if (this.periodicUpdateId != -1) return;
    this.periodicUpdateId = setInterval(this.perodicUpdate, MessageLimiter.PERIODIC_UPDATE_MS);
  }

  public StopSendingMessages = () => {
    window.clearTimeout(this.periodicUpdateId);
    this.periodicUpdateId = -1;
  }

  private perodicUpdate = () => {

  }

  private purgeOldMessages = () => {
    const oneSecondAgo = this.Now - 1000;
    this.pastMessages = this.pastMessages.filter(ms => ms > oneSecondAgo);
  }

  private get Now() { return +new Date(); }
}

export default Utility;