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
    };
  }

  play() {
    this.universe.clock().play();
  }

  pause() {
    this.universe.clock().pause();
  }

  setSpeed(speed) {
    this.universe.clock().setSpeed(speed);
  }

  setSatellite(satelliteId) {
    this.props.setSatellite(satelliteId);
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
          <FontAwesomeIcon icon={faPause} style={{padding: '4px'}}/>
        </button>
        <Select options={satelliteOptions} onChange={this.setSatellite.bind(this)}/>
        <Select options={speedOptions} value={100} onChange={this.setSpeed.bind(this)}/>
      </div>
    )
  }
}

export default ControlBar
