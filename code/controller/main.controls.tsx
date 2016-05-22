
import * as React from 'react';


interface IAppProps {
}

interface IAppState {
}

class MainControls extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1 className="screen-header">Main</h1>



        <div className="pure-g">
          <div id="button-upper-left" className="pure-u-6-24 btn left btn-active">
            <div className="control-button">
              <h3 className="control-text">
                Left
              </h3>
            </div>
          </div>

          <div id="button-special" className="pure-u-1-2 btn btn-active">
            <div className="control-button">
              <h3 className="control-text">
                Special
              </h3>
            </div>
          </div>

          <div id="button-upper-right" className="pure-u-6-24 btn right btn-active">
            <div className="control-button">
              <h3 className="control-text">
                Right
              </h3>
            </div>
          </div>

        </div>

        <div className="pure-g">
          <div id="button-lower-left" className="pure-u-1-2 btn left btn-active">
            <div className="control-button">
              <h3 className="control-text">
                Left
              </h3>
            </div>
          </div>

          <div id="button-lower-right" className="pure-u-1-2 btn right btn-active">
            <div className="control-button">
              <h3 className="control-text">
                Right
              </h3>
            </div>
          </div>

        </div>


      </div>
    );
  }
}

export default MainControls;