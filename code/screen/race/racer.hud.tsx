
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
      color: `#${this.props.racer.Color.toString(16)}`
    }
    return (
      <div>
        <h1 style={style} className="screen-header">
          Device: {this.props.racer.DeviceId}
        </h1>
        <h3 style={style} className="screen-header">
          Velocity: {Math.round(this.props.racer.LinearVelocity * 100) / 100}
        </h3>
      </div>
    );
  }
}

export default RacerHUD;