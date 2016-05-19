
import * as React from 'react';

interface IAppProps {
}

interface IAppState {
}

class MapChoice extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div>

        <p className="control-arrows">
          <span className="left">
            <i className="fa fa-chevron-circle-left fa-2x"></i>
          </span>
          <span className="right">
            <i className="fa fa-chevron-circle-right fa-2x"></i>
          </span>
        </p>
        <h3 id="track-name" className="track-name">Track Name</h3>
        <p>Image will go here</p>

      </div>
    );
  }
}

export default MapChoice;