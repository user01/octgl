
import * as React from 'react';

// import Racer from '../racer';

interface IAppProps {
  // racers: Racer[];
}

interface IAppState {
}

class LoadingBoard extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div id="loading-view" className="controls">
        <h1 className="screen-header">Loading</h1>
      </div>
    );
  }
}

export default LoadingBoard;