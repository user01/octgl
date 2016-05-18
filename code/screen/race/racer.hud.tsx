
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
              {RacerHUD.NumberSuffix(this.props.racer.Place) }
            </span>
          </p>
        </div>

        <div className="Aligner">
          <div className="Aligner-item--fixed Aligner-item message">

            {this.props.racer.ShowLapTime ? <p>Fastest Lap Time of <span className="lap-time">{this.props.racer.LapTimeMessage}</span></p> : ''}
            {this.props.racer.IsWrongWay ? <p>Wrong Way</p> : ''}
            {this.props.racer.ShowDerelictWarning ? <p>Keep Racing</p> : ''}
            {this.props.racer.IsDerelict ? <p>Race Over</p> : ''}
          </div>
        </div>
        
      </div>
    );

    const postHud = (
      <div className="Aligner">
        <div className="Aligner-item--fixed Aligner-item">

          <h1 className="post-race-message">
            {this.props.racer.IsDerelict ?
              'Waiting for Other Racers' :
              'Finished Race'}
          </h1>

          <h3 className="post-race-message">
            {this.props.racer.IsDerelict ? 'Currently ' : ''}{this.props.racer.Place}<sup>{RacerHUD.NumberSuffix(this.props.racer.Place) }</sup> Place
          </h3>
          <h3 className="post-race-message">
            {this.props.racer.IsDerelict ?
              'Did Not Finish' :
              <span>Total Time of&nbsp;
                <span className="lap-time">
                  {Racer.RenderDurationAsLapTime(this.props.racer.TotalDuration) }
                </span>
              </span> }
          </h3>
        </div>
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

  public static NumberSuffix = (place: number): string => {
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