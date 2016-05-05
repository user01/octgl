
import * as React from 'react';

// import Racer from '../racer';

interface IAppProps {
  // racers: Racer[];
}

interface IAppState {
}

class LeaderBoard extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div className="controls">
        <p>
          Placeholder for leaderboard
        </p>
      </div>
    );
  }
}

export default LeaderBoard;