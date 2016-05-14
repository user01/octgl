
import * as React from 'react';

// import Racer from '../racer';

interface IAppProps {
  seconds: number;
}

interface IAppState {
}

class ReadySet extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div id="ready-set" className="controls">
        <h1 className="count-down">{this.props.seconds > 0 ? this.props.seconds : 'Go!'}</h1>
      </div>
    );
  }
}

export default ReadySet;