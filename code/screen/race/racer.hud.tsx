
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
        <div className="controls">
          <canvas ref="render-canvas"></canvas>
        </div>

      </div>
    );
  }
}

export default RacerHUD;