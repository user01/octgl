import * as React from 'react';

import Racer from '../racer';

interface IAppProps {
  racers: Racer[];
}

interface IAppState {
}

class OnePlayer extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    if (this.props.racers.length != 1) {
      console.error('Bad racer set', this.props.racers);
    }
    return (
      <div className="controls player-hud">
        <div className="pure-g">
          <div className="pure-u-1">
            <div className="player-box full">
              ${this.props.racers[0].DeviceId}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OnePlayer;