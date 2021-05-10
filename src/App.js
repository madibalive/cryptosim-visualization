import Map from './components/Map';
import {universe, gsnetwork} from './demo';

function App() {
  return (
    <div className="App">
      <Map universe={universe} gsnetwork={gsnetwork} showInfo={true}/>
    </div>
  );
}

export default App;
