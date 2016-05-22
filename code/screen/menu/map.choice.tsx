
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
      <div>

        <h2 className="column-header">
          Track Selection
        </h2>

        <div className="flex-center">
          <div className="flex-container">
            <div className="track-selection">
              <div className="left"><i className="fa fa-chevron-circle-left fa-2x"></i></div>
              <div className="right"><i className="fa fa-chevron-circle-right fa-2x"></i></div>
              <div className="center">
                <h3 id="track-name" className="track-name">{this.props.track.name}</h3>
              </div>
            </div>


            <div className="image-wrapper">
              <img src={this.props.track.image} className="track-img" />
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default MapChoice;