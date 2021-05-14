import React from 'react';
import Select from './Select'
import './ControlBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons'


class ControlBar extends React.Component {

  constructor(props) {
    super(props);
    this.universe = props.universe;
    this.state = {
      speed: this.props.universe.clock().playSpeed(),
    };
  }

  play() {
    this.universe.clock().play();
  }

  pause() {
    this.universe.clock().pause();
  }

  setSpeed(speed) {
    this.setState({speed: speed});
    this.universe.clock().setSpeed(speed);
  }

  setSatellite(satelliteId) {
    this.props.setSatellite(satelliteId);
  }

  setTrajectoryDisplay(e) {
    this.props.setTrajectoryDisplay(e.target.checked);
  }

  setCoverageDisplay(e) {
    this.props.setCoverageDisplay(e.target.checked);
  }

   render() {
    // Select Network
    const satelliteOptions = Array.from(this.universe.satellites().keys())
      .map(s => { return { value: s, label: s }});

    const speedOptions = [
      {value: 1, label: '1x'},
      {value: 10, label: '10x'},
      {value: 100, label: '100x'},
      {value: 1000, label: '1000x'},
    ]

    return(
      <div className='control-bar'>
        <button onClick={this.play.bind(this)}>
          <FontAwesomeIcon icon={faPlay} style={{padding: '4px'}}/>
        </button>
        <button onClick={this.pause.bind(this)}>
          <FontAwesomeIcon icon={faPause} style={{padding: '4px', marginRight: '10px'}}/>
        </button>
        <label htmlFor='selectSatellite'>Satellite</label>
        <Select id='selectSatellite' options={satelliteOptions} onChange={this.setSatellite.bind(this)}/>
        <label htmlFor='selectSpeed'>Speed</label>
        <Select id='selectSpeed' options={speedOptions} selectedValue={this.state.speed} onChange={this.setSpeed.bind(this)}/>
        <label htmlFor='checkboxTrajectory' style={{'margin': '5px'}}>trajectory</label>
        <input onChange={this.setTrajectoryDisplay.bind(this)} type='checkbox' id='checkboxTrajectory' name='checkboxTrajectory' value='true' />
        <label htmlFor='checkboxCoverage' style={{'margin': '5px'}}>coverage</label>
        <input onChange={this.setCoverageDisplay.bind(this)} type='checkbox' id='checkboxCoverage' name='checkboxCoverage' value='true' />
      </div>
    )
  }
}

export default ControlBar
