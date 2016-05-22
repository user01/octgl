
import Utility from '../data/utility';

import * as React from 'react';

interface IAppProps {
}

interface IAppState {
}


class Waiting extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1 className="screen-header">Too Many Players</h1>
        <h3 className="screen-header">Waiting to join...</h3>
      </div>
    );
  }
}

export default Waiting;