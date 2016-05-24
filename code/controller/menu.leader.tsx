
import * as React from 'react';
import {MenuCommand, MenuCommands} from '../interfaces/menucommand';


interface IAppProps {
  handleCommand: (cmd: MenuCommands) => void;
}

interface IAppState {
}

class MenuLeader extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }


  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-2-3">
          <div className="pure-g">
            <div className="pure-u-1-2">

              <div className="control-button">
                <div className="flex-center">
                  <div className="flex-container">

                    <a className="pure-button third-control-button"
                      onTouchStart={() => { this.props.handleCommand(MenuCommands.Left) } }
                      onClick={() => { this.props.handleCommand(MenuCommands.Left) } }>

                      <div className="flex-center">
                        <div className="flex-container">

                          <i className="fa fa-chevron-circle-left fa-4x control-arrow"></i>

                        </div>
                      </div>

                    </a>

                  </div>
                </div>
              </div>

            </div>
            <div className="pure-u-1-2">

              <div className="control-button">
                <div className="flex-center">
                  <div className="flex-container">

                    <a className="pure-button third-control-button"
                      onTouchStart={() => { this.props.handleCommand(MenuCommands.Right) } }
                      onClick={() => { this.props.handleCommand(MenuCommands.Right) } }>
                      <div className="flex-center">
                        <div className="flex-container">
                          <i className="fa fa-chevron-circle-right fa-4x control-arrow"></i>
                        </div>
                      </div>
                    </a>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pure-u-1-3">



          <div className="control-button">
            <div className="flex-center">
              <div className="flex-container">

                <a className="pure-button third-control-button"
                  onTouchStart={() => { this.props.handleCommand(MenuCommands.Choose) } }
                  onClick={() => { this.props.handleCommand(MenuCommands.Choose) } }>
                  <div className="flex-center">
                    <div className="flex-container">
                      <p className="control-arrow control-text">Start</p>
                      <p><i className="fa fa-play-circle fa-4x control-arrow"></i></p>
                    </div>
                  </div>
                </a>

              </div>
            </div>
          </div>



        </div>
      </div>
    );
  }
}

export default MenuLeader;