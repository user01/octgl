
import * as React from 'react';

import Racer from './racer';
import RacerHUD from './racer.hud.tsx';
import Utility from '../../data/utility';

interface IAppProps {
  placements: Racer[];
  readyToLeave: boolean;
}

interface IAppState {
}

class LeaderBoard extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {

    const placements = this.props.placements ? this.props.placements : [];

    const leaders = placements.map((r, idx) => {
      const bgColor = Utility.NumberToColorSet(r.Color);
      const style = {
        background: `rgba(${bgColor.r},${bgColor.g},${bgColor.b},0.4)`
      };
      return (
        <div key={`place.${idx}`}>
          <div className="pure-g rank-line" style={style}>
            <div className="pure-u-1-3">
              <p className="place-rank">
                {r.Place}

                <span className="suffix">
                  {RacerHUD.NumberSuffix(r.Place) }
                </span>
              </p>
            </div>
            <div className="pure-u-1-3">
              <p className="place-rank">{r.Nickname}</p>
            </div>
            <div className="pure-u-1-3">
              <p className="place-rank">
                {r.FinishedRace ? <span className="lap-time">{Racer.RenderDurationAsLapTime(r.TotalDuration) }</span> : 'DNF'}
              </p>
            </div>
          </div>
        </div>
      )
    });

    return (
      <div className="controls leaderboard">
        <h1 className="leaderboard-title">{this.props.readyToLeave ? 'Any Control To Exit' : 'Race Complete'}</h1>
        {leaders}
      </div>
    );
  }
}

export default LeaderBoard;