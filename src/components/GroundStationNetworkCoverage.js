import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import GeoCoordinates from 'cryptosim/lib/geoCoordinates';
import crypto from 'crypto'
import * as turf from '@turf/turf'

const ORBIT_ALTITUDE = 500;

function getStationHash(universe) {
  let hash = crypto.createHash('sha1');
  for (const s of universe.stations().keys()) {
    hash.update(s);
  }
  return hash.digest('hex');
}

function coverageForStation(station, universe) {
  const origin = station.position();
  const boundary = []
  for (let theta = 0; theta < 2 * Math.PI; theta += 0.15) {
    let dlat = Math.sin(theta);
    let dlng = Math.cos(theta);
    let high = 50;
    let low = 0;
    let pos = origin.clone();
    pos.altitude = ORBIT_ALTITUDE;
    while (high - low > 0.05) {
      let distance = (high + low) / 2;
      const lat = origin.latitude + dlat * distance;
      const lng = origin.longitude + dlng * distance;
      pos = new GeoCoordinates(lat, lng, ORBIT_ALTITUDE);
      const angle = station.angleToPosition(pos);
      if (angle.elevation > 0) {
        low = distance;
      } else {
        high = distance;
      }
    }
    boundary.push([pos.longitude, pos.latitude]);
  }
  boundary.push(boundary[0]);
  return boundary;
}

class GroundStationNetworkCoverage extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      map: null,
      mapAreaId: 'coverage-polygon-' + uuidv4(),
      animationRequestId: null,
      stations: null,
    }
  }

  componentDidMount() {
    this.update();
  }

  componentWillUnmount() {
    if (!this.state.map) return;
    cancelAnimationFrame(this.state.animationRequestId);
    this.state.map.removeLayer(this.state.mapAreaId);
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
        'type': 'FeatureCollection',
        'features': [],
      }
    });

    // Add a new layer to visualize the polygon.
    map.addLayer({
      'id': this.state.mapAreaId,
      'type': 'fill',
      'source': this.state.mapAreaId,
      'layout': {},
      'paint': {
        'fill-color': '#333344',
        'fill-opacity': 0.5,
      }
    }, 'offlineSatelliteLayer'); // Note: abstraction leak!

    this.setState({map: map})
  }

  updateCoverage() {
    if (!this.state.map) return;
    let feature = null;
    for (const station of this.props.universe.stations().values()) {
      const coordinates = coverageForStation(station, this.props.universe);
      const tp = turf.polygon([coordinates]);
      if (!feature) {
        feature = tp;
      } else {
        feature = turf.union(feature, tp);
      }
    }
    // Consider removing turf package once per-layer opacity is implemented:
    // https://github.com/mapbox/mapbox-gl-js/issues/4090
    this.state.map.getSource(this.state.mapAreaId).setData(feature);
    this.setState({
      stations: getStationHash(this.props.universe),
    })
  }

  maybeUpdateCoverage() {
    if (getStationHash(this.props.universe) === this.state.stations) {
      return;
    }
    this.updateCoverage();
  }

  update() {
    this.maybeInitializeMap();
    this.maybeUpdateCoverage();
    const animationRequestId = requestAnimationFrame(this.update.bind(this));
    this.setState({
      animationRequestId: animationRequestId,
    });
  }

  render() {
    return null;
  }

}

export default GroundStationNetworkCoverage
