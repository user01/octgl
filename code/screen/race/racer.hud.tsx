
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

    const racerPlaceClass = `racer-place place-${this.props.racer.Place}`;
    const racingHud = (
      <div>
        <div className="left">
          <p className="lap-count"><i className="fa fa-flag-checkered"></i> {this.props.racer.Lap} <span className="lap-total">/ {this.props.totalLaps}</span></p>
        </div>
        <div className="right">
          <p className={racerPlaceClass}>
            {this.props.racer.Place}
            <span className="suffix">
              {RacerHUD.numberSuffix(this.props.racer.Place) }
            </span>
          </p>
        </div>
        <div className="message">
          <p>{this.props.racer.IsGrounded ? 'Grounded' : 'Free'} - {this.props.racer.CurrentTrackIndex}</p>
          <p>Angle {this.props.racer.temptemp}</p>
          <p>AI: {this.props.racer.temptemptemp}</p>
          {this.props.racer.ShowLapTime ? <p>Last Lap Time: {this.props.racer.LapTimeMessage}</p> : ''}
          {this.props.racer.IsWrongWay ? <p>Wrong Way</p> : ''}
          {this.props.racer.ShowDerelictWarning ? <p>Derelict Warning</p> : ''}
          {this.props.racer.IsDerelict ? <p>Derelict</p> : ''}
        </div>
      </div>
    );

    const postHud = (
      <div>
        <h1>Finished Race in {this.props.racer.Place}{RacerHUD.numberSuffix(this.props.racer.Place) } Place</h1>
      </div>
    );

    return (
      <div className="racer-hud" style={mainHudStyle}>
        {this.props.racer.DoneWithRace ? postHud : racingHud}
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

  private static numberSuffix = (place: number): string => {
    switch (place) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
    }
    return 'th';
  }

}

export default RacerHUD;