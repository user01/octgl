
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface IAppProps {
  device_id: number;
}

interface IAppState {
}

class RacerHUD extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <h2>Racer HUD - {this.props.device_id * 10}</h2>
      </div>
    );
  }
}

export default RacerHUD;