import * as React from 'react';

import Racer from '../racer';
import RacerHUD from '../racer.hud.tsx';

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
    // const style0 = RacerHUD.PlayerBoxStyle(this.props.racers[0]);
    const styles = this.props.racers.map(RacerHUD.PlayerBoxStyle);
    return (
      <div className="controls player-hud">
        <div className="pure-g">
          <div className="pure-u-1-2">
            <div className="player-box half-full" style={styles[0]}>
              <RacerHUD racer={this.props.racers[0]} />
            </div>
          </div>
          <div className="pure-u-1-2">
            <div className="player-box half-full" style={styles[1]}>
              <RacerHUD racer={this.props.racers[1]} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TwoPlayer;