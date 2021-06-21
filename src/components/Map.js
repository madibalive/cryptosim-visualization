import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css'
import PulsingDot from './pulsingDot';
// import * as antenna from './antenna.svg';
import GeoCoordinates from '@cryptosat/cryptosim/lib/geoCoordinates';


mapboxgl.accessToken =
  'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

class Map extends React.Component {

  static defaultProps = {
    zoom: 2,
    minZoom: 1.5,
    center: new GeoCoordinates(0, 0, 0),
  }

  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.state = {
      satellitePopup: null,
      highlightedSatelliteId: null,
    }
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      zoom: this.props.zoom,
      minZoom: this.props.minZoom,
      center: [this.props.center.longitude, this.props.center.latitude],
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
      'pulsing-dot-red', new PulsingDot(100, this.map), { pixelRatio: 2 });

    const greenColors = {
      outer: { r: 201, g: 200, b: 200 },
      inner: {r: 92, g: 207, b: 78 },
    }

    this.map.addImage(
      'pulsing-dot-green',
      new PulsingDot(100, this.map, greenColors),{ pixelRatio: 2 });

    this.map.addSource('satellites-offline', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [],
      }
    });

    // Note: this layer ID is used in other classes that manipulate the map
    // such as Trajectory and Coverage in order to specify the Z-ordering of
    // the layers. This is to prevent them from drawin new graphics on top of
    // the satellite graphics. This is a known abstraction leak. Changes made
    // to this layer name should be followed by a search and replace throughout
    // the codebase to find other hidden references to it and modifying them
    // as well.
    this.map.addLayer({
      'id': 'offlineSatelliteLayer',
      'type': 'symbol',
      'source': 'satellites-offline',
      'layout': {
        'icon-image': 'pulsing-dot-red'
      }
    });

    this.map.addSource('satellites-online', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [],
      }
    });

    this.map.addLayer({
      'id': 'onlineSatelliteLayer',
      'type': 'symbol',
      'source': 'satellites-online',
      'layout': {
        'icon-image': 'pulsing-dot-green'
      }
    });
  }

  setupStationPopup() {
    // Create a popup for displaying ground station info
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.map.on('mouseenter', 'groundStationLayer', (e) => {
      // Change the cursor style as a UI indicator.
      this.map.getCanvas().style.cursor = 'pointer';

      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.id;

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
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    this.setState({
      satellitePopup: popup,
    })

    for (const layer of ['offlineSatelliteLayer', 'onlineSatelliteLayer']) {
      this.map.on('mouseenter', layer, (e) => {
        // Change the cursor style as a UI indicator.
        this.map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const satelliteId = e.features[0].properties.id;
        const description = satelliteId;

        this.setState({
          highlightedSatelliteId: satelliteId,
        })

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

      this.map.on('mouseleave', layer, () => {
        this.map.getCanvas().style.cursor = '';
        popup.remove();
      });
    }
  }

  draw() {
    // Update satellite locations
    const offlineSatFeatures = [];
    const onlineSatFeatures = [];
    for (const sat of this.props.universe.satellites().values()) {
      const pos = sat.getPosition();
      const feature = {
        'type': 'Feature',
        'properties': {
          'id': sat.id(),
        },
        'geometry': {
          'type': 'Point',
          'coordinates': [pos.longitude, pos.latitude],
        }
      };
      // console.log(this.props.gsnetwork.visibleStations(sat));
      if (this.props.gsnetwork.visibleStations(sat).length) {
        // console.log('adding ' + sat.id() + ' to online layer');
        onlineSatFeatures.push(feature);
      } else {
        // console.log('adding ' + sat.id() + ' to offline layer');
        offlineSatFeatures.push(feature);
      }
    }
    this.map.getSource('satellites-offline').setData({
      'type': 'FeatureCollection',
      'features': offlineSatFeatures,
    });
    this.map.getSource('satellites-online').setData({
      'type': 'FeatureCollection',
      'features': onlineSatFeatures,
    }); 

    // Update satellite popup
    if (this.state.satellitePopup && this.state.highlightedSatelliteId) {
      const sat = this.props.universe.satellites().get(this.state.highlightedSatelliteId);
      const pos = sat.getPosition();
      const lng = pos.longitude;
      const lat = pos.latitude;
      this.state.satellitePopup.setLngLat([lng, lat]);
    }

    // Update ground station locations
    const gsFeatures = [];
    for (const station of this.props.universe.stations().values()) {
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
          universe: this.props.universe,
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

