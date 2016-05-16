
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Racer from './racer';
import Utility from '../../data/utility';
import * as WindowFrames from '../../interfaces/window.frame';

import * as R from 'ramda';

interface IAppProps {
  racer: Racer;
  frame: WindowFrames.WindowFrame;
  totalLaps: number;
}

interface IAppState {
}

class RacerHUD extends React.Component<IAppProps, IAppState> {

  private windowWidth = 10;
  private windowHeight = 10;

  private static id = 0;
  private id = RacerHUD.id++;
  constructor(props: IAppProps) {
    super(props);
  }

  componentDidMount() {
    window.addEventListener(`resize`, this.handleResize);
    this.handleResize();
  }
  componentWillUnmount() {
    window.removeEventListener(`resize`, this.handleResize);
  }

  private handleResize = () => {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
    this.render();
  }

  render() {

    let mainHudStyle = R.merge(
      {
        // 'boxShadow': `0 0 0 1em ${RacerHUD.NumberToColor(this.props.racer.Color)} inset`,
        // 'padding': '1em',
        // color: `#${this.props.racer.Color.toString(16)}`,
      },
      this.windowFrameToStyle()
    );

    return (
      <div className="racer-hud" style={mainHudStyle}>
        <div className="left">
          <p className="lap-count"><i className="fa fa-flag-checkered fa-2x"></i> {this.props.racer.Lap} / {this.props.totalLaps}</p>
        </div>
        <div className="right">
          <p className="racer-place">{this.props.racer.Place}st</p>
        </div>
        <div className="message">
          <p>{this.props.racer.IsGrounded ? 'Grounded' : 'Free'} - {this.props.racer.CurrentTrackIndex}</p>
          <p>Angle {this.props.racer.temptemp}</p>
          {this.props.racer.IsWrongWay ? <p>Wrong Way</p> : ''}
        </div>
      </div>
    );
  }

  private windowFrameToStyle = (frame = this.props.frame): {} => {
    const borderSize = R.pipe(
      R.multiply(0.005),
      Math.floor,
      R.max(4)
    )(this.windowWidth);
    const borderChunk = borderSize * 2;

    const left = Math.floor(this.windowWidth * frame.x) + 'px';
    const top = Math.floor(this.windowHeight * frame.y) + 'px';
    const width = (Math.floor(this.windowWidth * frame.width) - borderChunk) + 'px';
    const height = (Math.floor(this.windowHeight * frame.height) - borderChunk) + 'px';

    return {
      border: `${borderSize}px ${Utility.NumberToColor(this.props.racer.Color)} solid`,
      position: 'absolute',
      left,
      top,
      width,
      height
    };
  }

}

export default RacerHUD;