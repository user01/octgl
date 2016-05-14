
/// <reference path="../../typings/references.d.ts" />

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
}

export default Utility;