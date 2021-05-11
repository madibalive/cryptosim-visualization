import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './Map.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import PulsingDot from './pulsingDot';
// import * as antenna from './antenna.svg';


// mapboxgl.accessToken = Config.mapboxglAccessToken;
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class Map extends React.Component {

  constructor(props) {
    super(props);
    this.universe = props.universe;
    this.gsnetwork = props.gsnetwork; // DELETE
    this.showInfo = !!props.showInfo;
    this.mapRef = React.createRef();
    const sat = this.universe.satellites().get(this.props.satelliteId);
    this.state = {
      displayPos: sat.getPosition(),
      online: 'false',
      closestStation: null
    };
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 2,
      minZoom: 1.5,
      renderWorldCopies: true,
    });

    this.map.on('load', function () {
      this.map.resize();

      this.map.addImage(
        'pulsing-dot', new PulsingDot(100, this.map), { pixelRatio: 2 });

      this.map.addSource('satellites', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [0, 0]
              }
            }
          ]
        }
      });
    
      this.map.addLayer({
        'id': 'satelliteLayer',
        'type': 'symbol',
        'source': 'satellites',
        'layout': {
          'icon-image': 'pulsing-dot'
        }
      });

      this.map.addSource('groundStations', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [0, 0]
              }
            }
          ]
        }
      });

      this.map.addLayer({
        'id': 'groundStationLayer',
        'type': 'circle',
        'source': 'groundStations',
        'paint': {
          'circle-radius': 5,
          'circle-color': '#5b94c6',
        }
      });

      this.animate();
    }.bind(this));  
  }

  animate() {
    this.draw();
    // Request the next frame of the animation.
    requestAnimationFrame(this.animate.bind(this));
  }

  draw() {
    // Update satellite locations
    const satFeatures = [];
    for (const sat of this.universe.satellites().values()) {
      const pos = sat.getPosition();
      satFeatures.push({
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [pos.longitude, pos.latitude],
        }
      })
    }
    this.map.getSource('satellites').setData({
      'type': 'FeatureCollection',
      'features': satFeatures,
    }); 

    // Update ground station locations
    const gsFeatures = [];
    for (const station of this.universe.stations().values()) {
      const pos = station.position();
      gsFeatures.push({
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [pos.longitude, pos.latitude],
        }
      });
    }
    this.map.getSource('groundStations').setData({
      'type': 'FeatureCollection',
      'features': gsFeatures,
    }); 


    const sat = this.universe.satellites().get(this.props.satelliteId);
    this.setState({
      displayPos: sat.getPosition(),
      online: this.gsnetwork.visibleStations(sat).length > 0 ? 'true': 'false',
      closestStation: this.gsnetwork.closestTo(sat),
    });

  }

   render() {
    const sat = this.universe.satellites().get(this.props.satelliteId);
    const pos = this.state.displayPos;
    const online = this.state.online;
    let station = 'N/A';
    let elevation = 'N/A';
    let distance = 'N/A';
    let azimuth = 'N/A';
    if (this.state.closestStation != null) {
      station = this.state.closestStation.id();
      const angle = this.state.closestStation.angleTo(sat);
      elevation = angle.elevation;
      azimuth = angle.azimuth;
      distance = angle.distance;
    }

    let maybeShowInfo = '';
    if (this.showInfo) {
      maybeShowInfo = (
        <div className='map-info'>
          <table>
            <tbody>
              <tr><td className='title'>Longitude:</td><td className='value'>{pos.longitude}</td></tr>
              <tr><td className='title'>Latitude:</td><td className='value'>{pos.latitude}</td></tr>
              <tr><td className='title'>Altitude:</td><td className='value'>{pos.altitude}</td></tr>
              <tr><td className='title'>Online:</td><td className='value'>{online}</td></tr>
              <tr><td className='title'>Station:</td><td className='value'>{station}</td></tr>
              <tr><td className='title'>Distance:</td><td className='value'>{distance}</td></tr>
              <tr><td className='title'>Elevation:</td><td className='value'>{elevation}</td></tr>
              <tr><td className='title'>Azimuth:</td><td className='value'>{azimuth}</td></tr>
            </tbody>
          </table>
        </div>
      )
    }

    return(
      <div className='map-container'>
        {maybeShowInfo}
        <div ref={this.mapRef} style={{'height': '100%'}}/>
        }
      </div>
    )
  }

}



export default Map

