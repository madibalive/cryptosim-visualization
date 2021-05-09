import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css'
import PulsingDot from './pulsingDot';


// mapboxgl.accessToken = Config.mapboxglAccessToken;
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class Map extends React.Component {

  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    const lat = 32.5627785;
    const lng = -15.2939467;

    this.map = new mapboxgl.Map({
      container: this.mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: 2,
    });

    this.map.on('load', function () {
      this.map.resize();

      this.map.addImage(
        'pulsing-dot', new PulsingDot(100, this.map), { pixelRatio: 2 });

      this.map.addSource('points', {
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
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
          'icon-image': 'pulsing-dot'
        }
      });

    }.bind(this));  
  }

   render() {
    return(
      <div className='map-container'>
        <div ref={this.mapRef} style={{'height': '100%'}}/>
      </div>
    )
  }

}



export default Map

