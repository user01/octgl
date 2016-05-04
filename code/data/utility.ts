
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

}

export default Utility;