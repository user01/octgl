
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Racer from './racer';

interface IAppProps {
  racer: Racer;
}

interface IAppState {
}

class RacerHUD extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    let style = {
      // color: `#${this.props.racer.Color.toString(16)}`,
    }
    let ss = {
      float: 'right'
    };
    return (
      <div style={style}>
        <div style={ss}>
          <p>Floated content.</p>
        </div>
      </div>
    );
  }

  public static PlayerBoxStyle = (racer: Racer) => {
    return {
      'boxShadow': `0 0 0 1em ${RacerHUD.NumberToColor(racer.Color)} inset`,
      'padding': '1em'
    }
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