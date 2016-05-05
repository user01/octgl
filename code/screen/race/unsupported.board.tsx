
import * as React from 'react';

// import Racer from '../racer';

interface IAppProps {
  // racers: Racer[];
}

interface IAppState {
}

class UnsupportedBoard extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div className="controls">
        <h1>
          Appologies
        </h1>
        <p>
          This Screen does not support the graphics engine.
        </p>
      </div>
    );
  }
}

export default UnsupportedBoard;