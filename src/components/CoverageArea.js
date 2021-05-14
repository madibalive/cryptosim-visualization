import React from 'react';
import GeoCoordinates from 'cryptosim/lib/geoCoordinates';

class CoverageArea extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      map: null
    }
  }

  componentDidMount() {
    this.update();
  }

  maybeInitializeMap() {
    if (this.state.map) return;
    const map = this.props.getMap();
    if (!map) return;
    // https://github.com/mapbox/mapbox-gl-directions/issues/111
    if (!(map._loaded)) return;

    // unclear why this satement below is necessary. Seems like there is
    // a race condition happenning somehow.
    if (map.getSource('coverage')) return;
    map.addSource('coverage', {
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
      'id': 'coverage',
      'type': 'fill',
      'source': 'coverage', // reference the data source
      'layout': {},
      'paint': {
        'fill-color': '#9afc9a',
        'fill-opacity': 0.5,
      }
    }, 'satelliteLayer');

    // Add a black outline around the polygon.
    map.addLayer({
      'id': 'outline',
      'type': 'line',
      'source': 'coverage',
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
    this.state.map.getSource('coverage').setData({
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
    requestAnimationFrame(this.update.bind(this));
  }

  render() {
    return <div>{this.props.satellite.id()}</div>
  }

}

export default CoverageArea
