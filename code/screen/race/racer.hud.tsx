
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Racer from './racer';
import * as WindowFrames from '../../interfaces/window.frame';

import * as R from 'ramda';

interface IAppProps {
  racer: Racer;
  frame: WindowFrames.WindowFrame;
  totalLaps: number;
}

interface IAppState {
}

class RacerHUD extends React.Component<IAppProps, IAppState> {

  private windowWidth = 10;
  private windowHeight = 10;

  private static id = 0;
  private id = RacerHUD.id++;
  constructor(props: IAppProps) {
    super(props);
  }

  componentDidMount() {
    window.addEventListener(`resize`, this.handleResize);
    this.handleResize();
  }
  componentWillUnmount() {
    window.removeEventListener(`resize`, this.handleResize);
  }

  private handleResize = () => {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.render();
  }

  render() {

    let mainHudStyle = R.merge(
      {
        // 'boxShadow': `0 0 0 1em ${RacerHUD.NumberToColor(this.props.racer.Color)} inset`,
        // 'padding': '1em',
        // color: `#${this.props.racer.Color.toString(16)}`,
      },
      this.windowFrameToStyle()
    );

    return (
      <div className="racer-hud" style={mainHudStyle}>
        <div className="left">
          <p className="lap-count"><i className="fa fa-flag-checkered fa-2x"></i> {this.props.racer.Lap} / {this.props.totalLaps}</p>
        </div>
        <div className="right">
          <p className="racer-place">{this.props.racer.Place}st</p>
        </div>
      </div>
    );
  }

  private windowFrameToStyle = (frame = this.props.frame): {} => {
    const borderSize = R.pipe(
      R.multiply(0.005),
      Math.floor,
      R.max(4)
    )(this.windowWidth);
    const borderChunk = borderSize * 2;

    const left = Math.floor(this.windowWidth * frame.x) + 'px';
    const top = Math.floor(this.windowHeight * frame.y) + 'px';
    const width = (Math.floor(this.windowWidth * frame.width) - borderChunk) + 'px';
    const height = (Math.floor(this.windowHeight * frame.height) - borderChunk) + 'px';

    return {
      border: `${borderSize}px ${RacerHUD.NumberToColor(this.props.racer.Color)} solid`,
      position: 'absolute',
      left,
      top,
      width,
      height
    };
  }

  public static NumberToColor(num) {
    num >>>= 0;
    var b = num & 0xFF,
      g = (num & 0xFF00) >>> 8,
      r = (num & 0xFF0000) >>> 16;
    return "rgb(" + [r, g, b].join(",") + ")";
  }
}

// <div className={`player-box ${this.props.class}`} style={style}>
// <h1 style={style} className="screen-header">
//   Device: {this.props.racer.DeviceId}
// </h1>
// <h3 style={style} className="screen-header">
//   Velocity: {Math.round(this.props.racer.LinearVelocity * 100) / 100}
// </h3>
// <h3 style={style} className="screen-header">
//   Z Velocity: {this.props.racer.zLinear}
// </h3>
// <h3 style={style} className="screen-header">
//   Lap: {this.props.racer.Lap} / {Math.floor(this.props.racer.PercentDoneTrack * 100) } / Next {this.props.racer.CurrentTrackIndex}
// </h3>
export default RacerHUD;