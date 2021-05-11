import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './Map.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import PulsingDot from './pulsingDot';
import GeoCoordinates from 'cryptosim/lib/geoCoordinates';
// import * as antenna from './antenna.svg';


// mapboxgl.accessToken = Config.mapboxglAccessToken;
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class Map extends React.Component {

  constructor(props) {
    super(props);
    this.universe = props.universe;
    this.mapRef = React.createRef();
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

      this.map.addSource('coverage', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': [],
          }
        }
      });
         
      // Add a new layer to visualize the polygon.
      this.map.addLayer({
        'id': 'coverage',
        'type': 'fill',
        'source': 'coverage', // reference the data source
        'layout': {},
        'paint': {
          'fill-color': '#fccfcf',
          'fill-opacity': 0.5
        }
      });

      // Add a black outline around the polygon.
      this.map.addLayer({
        'id': 'outline',
        'type': 'line',
        'source': 'coverage',
        'layout': {},
        'paint': {
          'line-color': '#555',
          'line-width': 1
        }
      });

      this.animate();
    }.bind(this));  
  }

  animate() {
    this.draw();
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

    // Update satellite coverage
    const sat = this.universe.satellites().get('crypto1');
    const origin = sat.getPosition();
    const clock = this.universe.clock();
    const coords = []
    for (let theta = 0; theta < 2 * Math.PI; theta += 0.15) {
      let dlat = Math.sin(theta);
      let dlng = Math.cos(theta);
      let high = 50;
      let low = 0;
      let pos = origin;
      let count = 0;
      while (high - low > 0.05) {
        let distance = (high + low) / 2;
        const lat = origin.latitude + dlat * distance;
        const lng = origin.longitude + dlng * distance;
        pos = new GeoCoordinates(lat, lng, 0);
        if (sat.orbit().hasLineOfSight(clock, pos)) {
          low = distance;
        } else {
          high = distance;
        }
      }
      coords.push([pos.longitude, pos.latitude]);
    }
    coords.push(coords[0]);
    window.coords = coords;
    this.map.getSource('coverage').setData({
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [coords],
      }
    }); 
  }

   render() {
    return(
      <div className='map-container'>
        <div ref={this.mapRef} style={{'height': '100%'}}/>
        }
      </div>
    )
  }

}



export default Map

