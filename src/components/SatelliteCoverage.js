import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import GeoCoordinates from '@cryptosat/cryptosim/lib/geoCoordinates';

class SatelliteCoverage extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      map: null,
      mapAreaId: 'coverage-polygon-' + uuidv4(),
      mapBorderId: 'coverage-outline-' + uuidv4(),
      animationRequestId: null,
    }
  }

  componentDidMount() {
    this.update();
  }

  componentWillUnmount() {
    if (!this.state.map) return;
    cancelAnimationFrame(this.state.animationRequestId);
    this.state.map.removeLayer(this.state.mapAreaId);
    this.state.map.removeLayer(this.state.mapBorderId);
    this.state.map.removeSource(this.state.mapAreaId);
  }

  maybeInitializeMap() {
    if (this.state.map) return;
    const map = this.props.getMap();
    if (!map) return;
    // https://github.com/mapbox/mapbox-gl-directions/issues/111
    if (!(map._loaded)) return;

    // unclear why this satement below is necessary. Seems like there is
    // a race condition happenning somehow.
    if (map.getSource(this.state.mapAreaId)) return;
    map.addSource(this.state.mapAreaId, {
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
    map.addLayer({
      'id': this.state.mapAreaId,
      'type': 'fill',
      'source': this.state.mapAreaId,
      'layout': {},
      'paint': {
        'fill-color': '#9afc9a',
        'fill-opacity': 0.5,
      }
    }, 'offlineSatelliteLayer'); // Note: abstraction leak!

    // Add a black outline around the polygon.
    map.addLayer({
      'id': this.state.mapBorderId,
      'type': 'line',
      'source': this.state.mapAreaId,
      'layout': {},
      'paint': {
        'line-color': '#555',
        'line-width': 1,
        'line-dasharray': [3, 3],

      }
    });
    this.setState({map: map})
  }

  updateCoverage() {
    if (!this.state.map) return;
    // Update satellite coverage
    const origin = this.props.satellite.getPosition();
    const clock = this.props.universe.clock();
    const boundary = []
    for (let theta = 0; theta < 2 * Math.PI; theta += 0.15) {
      let dlat = Math.sin(theta);
      let dlng = Math.cos(theta);
      let high = 50;
      let low = 0;
      let pos = origin;
      while (high - low > 0.05) {
        let distance = (high + low) / 2;
        const lat = origin.latitude + dlat * distance;
        const lng = origin.longitude + dlng * distance;
        pos = new GeoCoordinates(lat, lng, 0);
        if (this.props.satellite.orbit().hasLineOfSight(clock, pos)) {
          low = distance;
        } else {
          high = distance;
        }
      }
      boundary.push([pos.longitude, pos.latitude]);
    }
    boundary.push(boundary[0]);
    this.state.map.getSource(this.state.mapAreaId).setData({
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [boundary],
      }
    }); 
  }

  update() {
    this.maybeInitializeMap();
    this.updateCoverage();
    const animationRequestId = requestAnimationFrame(this.update.bind(this));
    this.setState({
      animationRequestId: animationRequestId,
    });
  }

  render() {
    return null;
  }

}

export default SatelliteCoverage
