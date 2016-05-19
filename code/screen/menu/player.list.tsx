
import * as React from 'react';

import Player from '../player';
import Utility from '../../data/utility';


interface IAppProps {
  players: Player[];
}

interface IAppState {
}

class PlayerList extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    const players = this.props.players.map((p, idx) => {
      const style = {
        background: Utility.NumberToColor(p.Color)
      };

      return (
        <li key={`player.${idx}`} style={style}>
          {p.DeviceId} - {p.Nickname}
        </li>
      );
    });

    return (
      <div className="player-list">
        <h2>Current Players</h2>
        <ul className="player-list">
          {players}
        </ul>
      </div>
    );
  }
}

export default PlayerList;