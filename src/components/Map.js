import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css'
import PulsingDot from './pulsingDot';
// import * as antenna from './antenna.svg';


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
      this.setupStations();
      this.setupSatellites();
      this.setupStationPopup();
      this.setupSatellitePopup();
      this.animate();
    }.bind(this));
  }

  animate() {
    this.draw();
    requestAnimationFrame(this.animate.bind(this));
  }

  setupStations() {
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
  }

  setupSatellites() {
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
  }

  setupStationPopup() {
    // Create a popup for displaying ground station info
    let popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.map.on('mouseenter', 'groundStationLayer', (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = 'pointer';

      let coordinates = e.features[0].geometry.coordinates.slice();
      let description = e.features[0].properties.id;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(this.map);
    });

    this.map.on('mouseleave', 'groundStationLayer', () => {
      this.map.getCanvas().style.cursor = '';
      popup.remove();
    });
  }

  setupSatellitePopup() {
    // Create a popup for displaying ground station info
    let popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.map.on('mouseenter', 'satelliteLayer', (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = 'pointer';

      let coordinates = e.features[0].geometry.coordinates.slice();
      let description = e.features[0].properties.id;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(this.map);
    });

    this.map.on('mouseleave', 'satelliteLayer', () => {
      this.map.getCanvas().style.cursor = '';
      popup.remove();
    });
  }

  draw() {
    // Update satellite locations
    const satFeatures = [];
    for (const sat of this.universe.satellites().values()) {
      const pos = sat.getPosition();
      satFeatures.push({
        'type': 'Feature',
        'properties': {
          'id': sat.id(),
        },
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
        'properties': {
          'id': station.id(),
        },
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
  }

  childrenWithMap() {
    const getMap = () => { return this.map; };
    const childrenWithProps = React.Children.map(this.props.children, child => {
      // checking isValidElement is the safe way and avoids a typescript error too
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          universe: this.universe,
          getMap: getMap
        });
      }
      return child;
    });
    return childrenWithProps
  }

   render() {
    return(
      <div className='map-container'>
        <div ref={this.mapRef} style={{'height': '100%'}}/>
        {this.childrenWithMap()}
      </div>
    )
  }

}



export default Map

