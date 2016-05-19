
import * as React from 'react';

interface IAppProps {
}

interface IAppState {
}

class PlayerList extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <p>More options here</p>
        <ul className="player-list">
        </ul>
      </div>
    );
  }
}

export default PlayerList;