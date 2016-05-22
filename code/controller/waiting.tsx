
import Utility from '../data/utility';

import * as React from 'react';

interface IAppProps {
}

interface IAppState {
}

const messages = [
  'Hang on. Contabulating.',
  'One moment.',
  '.',
];

class Waiting extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div className="controls">
        <h1 className="screen-header">{Utility.RandomItem(messages) }</h1>
      </div>
    );
  }
}

export default Waiting;