
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
              <div className="flex-center">
                <div className="btn-honk btn btn-active"
                  onTouchStart={() => { this.props.handleCommand(MenuCommands.Left) } }
                  onClick={() => { this.props.handleCommand(MenuCommands.Left) } }>
                  <p><i className="fa fa-chevron-circle-left fa-4x"></i></p>
                </div>
              </div>
            </div>
            <div className="pure-u-1-2">
              <div className="flex-center">
                <div className="btn-honk btn btn-active"
                  onTouchStart={() => { this.props.handleCommand(MenuCommands.Right) } }
                  onClick={() => { this.props.handleCommand(MenuCommands.Right) } }>
                  <p><i className="fa fa-chevron-circle-right fa-4x"></i></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pure-u-1-3">
          <div className="flex-center">
            <div className="btn-honk btn btn-active"
              onTouchStart={() => { this.props.handleCommand(MenuCommands.Choose) } }
              onClick={() => { this.props.handleCommand(MenuCommands.Choose) } }>
              <p>Race!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MenuLeader;