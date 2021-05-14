import React from 'react';
import Map from './components/Map';
import ControlBar from './components/ControlBar';
import CoverageArea from './components/CoverageArea';
import SatelliteInfoBar from './components/SatelliteInfoBar';
import {universe, gsnetwork} from './demo';

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      satelliteId: universe.satellites().keys().next().value,
    };
  }

  setSatellite(satelliteId) {
    this.setState({satelliteId: satelliteId});
  }

  render() {
    const sat = universe.satellites().get(this.state.satelliteId);
    return (
      <div className="App">
        <ControlBar universe={universe}
                    setSatellite={this.setSatellite.bind(this)}/>
        <SatelliteInfoBar satellite={sat} gsnetwork={gsnetwork} />
        <Map universe={universe}>
          <CoverageArea satellite={sat}/>
        </Map>
      </div>
    );
  }
}

export default App;
