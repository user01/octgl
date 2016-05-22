
import * as React from 'react';


interface IAppProps {
}

interface IAppState {
}

class MenuLeader extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1 className="screen-header">Menu Leader</h1>
      </div>
    );
  }
}

export default MenuLeader;