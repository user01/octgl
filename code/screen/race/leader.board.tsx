
import * as React from 'react';

import Racer from './racer';

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

      return (
        <div>
          Placeholder for leaderboard
        </div>
      )
    });

    return (
      <div className="controls leaderboard">
        <h1>Results</h1>
      </div>
    );
  }
}

export default LeaderBoard;