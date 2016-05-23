
import * as React from 'react';

import {RacerCommand} from '../interfaces/racercommand';

interface IAppProps {
  handleUpdatedRacerCommand: (racer: RacerCommand) => void;

}

interface IAppState {
}

class MainControls extends React.Component<IAppProps, IAppState> {
  private get currentRacerCommand(): RacerCommand {
    return {
      left: this.left,
      right: this.right,
      special: this.special
    }
  };
  private left = false;
  private special = false;
  private right = false;

  constructor(props: IAppProps) {
    super(props);
  }

  private leftOn = (e) => {
    e.preventDefault();
    this.left = true;
    this.sendCurrentCommand();
  }
  private leftOff = (e) => {
    e.preventDefault();
    this.left = false;
    this.sendCurrentCommand();
  }

  private rightOn = (e) => {
    e.preventDefault();
    this.right = true;
    this.sendCurrentCommand();
  }
  private rightOff = (e) => {
    e.preventDefault();
    this.right = false;
    this.sendCurrentCommand();
  }

  private sendCurrentCommand = () => {
    this.props.handleUpdatedRacerCommand(this.currentRacerCommand);
  }

  render() {
    return (
      <div>

        <div className="pure-g">
          <div id="button-lower-left" className="pure-u-1-2 btn left btn-active">
            <div className="control-button">
              <div className="flex-center">
                <div className="flex-container">
                  <a className="pure-button direction-control-button"
                    onTouchStart={this.leftOn}
                    onMouseDown={this.leftOn}
                    onTouchEnd={this.leftOff}
                    onMouseUp={this.leftOff}
                    >

                    <div className="flex-center">
                      <div className="flex-container">
                        <i className="fa fa-arrow-left fa-5x control-arrow"></i>
                      </div>
                    </div>

                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="button-lower-right" className="pure-u-1-2 btn right btn-active">
            <div className="control-button">
              <div className="flex-center">
                <div className="flex-container"
                  >
                  <a className="pure-button direction-control-button"
                    onTouchStart={this.rightOn}
                    onMouseDown={this.rightOn}
                    onTouchEnd={this.rightOff}
                    onMouseUp={this.rightOff}
                    >
                    <div className="flex-center">
                      <div className="flex-container">
                        <i className="fa fa-arrow-right fa-5x control-arrow"></i>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>


      </div>
    );
  }
}

export default MainControls;