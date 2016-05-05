import * as React from 'react';

import Racer from '../racer';

interface IAppProps {
  racers: Racer[];
}

interface IAppState {
}

class TwoPlayer extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    if (this.props.racers.length != 2) {
      console.error('Bad racer set', this.props.racers);
    }
    return (
      <div className="controls player-hud">
        <div className="pure-g">
          <div className="pure-u-1-2">
            <div className="player-box half-full">
              ${this.props.racers[0].DeviceId }
            </div>
          </div>
          <div className="pure-u-1-2">
            <div className="player-box half-full">
              ${this.props.racers[1].DeviceId }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TwoPlayer;