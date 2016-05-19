
import * as React from 'react';

import TrackData from '../../interfaces/track.data';

interface IAppProps {
  track: TrackData;
}

interface IAppState {
}

class MapChoice extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div className="flex-container">
        <p className="control-arrows">
          <i className="fa fa-chevron-circle-up fa-2x"></i>
        </p>

        <h3 id="track-name" className="track-name">{this.props.track.name}</h3>
        <div className="image-wrapper">
          <img src={this.props.track.image} className="track-img" />
        </div>

        <p className="control-arrows">
          <i className="fa fa-chevron-circle-down fa-2x"></i>
        </p>
      </div>
    );
  }
}

export default MapChoice;