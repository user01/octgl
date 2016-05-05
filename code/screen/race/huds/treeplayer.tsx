import * as React from 'react';

import Racer from '../racer';

interface IAppProps {
  racers: Racer[];
}

interface IAppState {
}

class ThreePlayer extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    if (this.props.racers.length != 3) {
      console.error('Bad racer set', this.props.racers);
    }
    return (
      <div id="players-03" className="controls player-hud">
        <div className="pure-g">
          <div className="pure-u-1-2">
            <div className="player-box quarter-full">
              ${this.props.racers[0].DeviceId }
            </div>
            <div className="player-box quarter-full">
              ${this.props.racers[1].DeviceId }
            </div>
          </div>
          <div className="pure-u-1-2">
            <div className="player-box half-full">
              ${this.props.racers[2].DeviceId }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ThreePlayer;