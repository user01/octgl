
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
    return (
      <div className="controls leaderboard">
        <p>
          Placeholder for leaderboard
        </p>
      </div>
    );
  }
}

export default LeaderBoard;