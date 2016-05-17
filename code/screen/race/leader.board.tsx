
import * as React from 'react';

import Racer from './racer';
import Utility from '../../data/utility';

interface IAppProps {
  placements: Racer[];
}

interface IAppState {
}

class LeaderBoard extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {

    const leaders = this.props.placements.map((r) => {
      const color = Utility.NumberToColor(r.Color);
      const style = { color };
      return (
        <div>
          <div className="pure-g">
            <div className="pure-u-1-3">
              <p className="place-rank">{r.Place}</p>
            </div>
            <div className="pure-u-2-3" style={style}>
              <p className="place-rank">{r.Nickname}</p>
            </div>
          </div>
        </div>
      )
    });

    return (
      <div className="controls leaderboard">
        <h1>Results</h1>
        {leaders}
      </div>
    );
  }
}

export default LeaderBoard;