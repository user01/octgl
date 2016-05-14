
export interface WindowFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const Frames: WindowFrame[][] = [

  //#############################################################################
  //  One Player
  //#############################################################################
  [
    {
      x: 0,
      y: 0,
      width: 1,
      height: 1
    }
  ],

  //#############################################################################
  //  Two Players
  //#############################################################################
  [
    {
      x: 0,
      y: 0,
      width: 0.5,
      height: 1
    },
    {
      x: 0.5,
      y: 0,
      width: 0.5,
      height: 1
    }
  ],

  //#############################################################################
  //  Three Players
  //#############################################################################
  [
    {
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5
    },
    {
      x: 0,
      y: 0.5,
      width: 0.5,
      height: 0.5
    },
    {
      x: 0.5,
      y: 0,
      width: 0.5,
      height: 1
    }
  ],

  //#############################################################################
  //  Four Players
  //#############################################################################
  [
    {
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5
    },
    {
      x: 0,
      y: 0.5,
      width: 0.5,
      height: 0.5
    },
    {
      x: 0.5,
      y: 0,
      width: 0.5,
      height: 0.5
    },
    {
      x: 0.5,
      y: 0.5,
      width: 0.5,
      height: 0.5
    }
  ],

];


export const WindowFrameToBABYLONViewport = (frame: WindowFrame): BABYLON.Viewport => {
  return new BABYLON.Viewport(frame.x, frame.y, frame.width, frame.height);
}

export default WindowFrame;