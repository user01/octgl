import * as React from 'react';

import Racer from './racer';
import RacerHUD from './racer.hud.tsx';

import * as WindowFrames from './../../interfaces/window.frame';

interface IAppProps {
  racers: Racer[];
}

interface IAppState {
}

class RacerHUDs extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div className="controls player-hud">
        {this.props.racers.map((racer, index) =>
          <RacerHUD
            racer={racer}
            frame={WindowFrames.WindowFrameToBABYLONViewport(WindowFrames.Frames[this.props.racers.length - 1][index]) }
            />) }
      </div>
    );
  }
}

export default RacerHUDs;