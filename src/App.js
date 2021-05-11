import React from 'react';
import Map from './components/Map';
import ControlBar from './components/ControlBar';
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
    return (
      <div className="App">
        <ControlBar universe={universe}
                    setSatellite={this.setSatellite.bind(this)}/>
        <Map universe={universe} satelliteId={this.state.satelliteId}
             gsnetwork={gsnetwork} showInfo={true}/>
      </div>
    );
  }
}

export default App;
