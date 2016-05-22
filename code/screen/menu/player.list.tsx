
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
        <div key={`player.${idx}`} className="player-block pure-u-1-2" style={style}>
          <div className="player-block-inner">
            <h3>{p.Nickname}</h3>
            <img width={128} height={128} src={p.ProfilePicture}/>
          </div>
        </div>
      );
    });

    return (
      <div className="player-list">
        <h2 className="game-header">OctGL</h2>
        <div className="player-list pure-g">
          {players}
        </div>
      </div>
    );
  }
}

export default PlayerList;