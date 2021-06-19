import React from 'react';
import './App.css';
import Map from './components/Map';
import ControlBar from './components/ControlBar';
import GroundStationNetworkCoverage from './components/GroundStationNetworkCoverage';
import SatelliteInfoBar from './components/SatelliteInfoBar';
import Trajectory from './components/Trajectory';
import {universe, gsnetwork} from './demo';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      satelliteId: universe.satellites().keys().next().value,
      displayCoverage: false,
      displayTrajectory: false,
    };
  }

  setSatellite(satelliteId) {
    this.setState({satelliteId: satelliteId});
  }

  setCoverageDisplay(value) {
    this.setState({displayCoverage: value});
  }

  setTrajectoryDisplay(value) {
    this.setState({displayTrajectory: value});
  }

  render() {
    const sat = universe.satellites().get(this.state.satelliteId);
    let trajectory = this.state.displayTrajectory ? <Trajectory satellite={sat}/> : null;
    let coverage = this.state.displayCoverage ? <GroundStationNetworkCoverage gsnetwork={gsnetwork}/> : null;
    return (
      <div className="App">
        <ControlBar universe={universe}
                    setSatellite={this.setSatellite.bind(this)}
                    setCoverageDisplay={this.setCoverageDisplay.bind(this)}
                    setTrajectoryDisplay={this.setTrajectoryDisplay.bind(this)}/>
        <SatelliteInfoBar satellite={sat} gsnetwork={gsnetwork} />
        <Map universe={universe} gsnetwork={gsnetwork}>
          {coverage}
          {trajectory}
        </Map>
      </div>
    );
  }
}

export default App;
