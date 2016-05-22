
import * as React from 'react';


interface IAppProps {
}

interface IAppState {
}

class MenuFollower extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div className="controls">
        <h1 className="screen-header">Hang on</h1>
        <h2 className="screen-header">The race will start soon.</h2>
      </div>
    );
  }
}

export default MenuFollower;