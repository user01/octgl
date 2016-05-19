
import * as React from 'react';

interface IAppProps {
  pureClass: string;
  children?: Array<any>;
}

interface IAppState {
}

class ControlBox extends React.Component<IAppProps, IAppState> {
  constructor(props: IAppProps) {
    super(props);
  }

  render() {
    const masterClass = `${this.props.pureClass} control-box`;
    return (
      <div className={masterClass}>
        <div className="flex-center">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ControlBox;