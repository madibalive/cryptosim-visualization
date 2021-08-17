import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import SimulatedClock from '@cryptosat/cryptosim/lib/clocks/simulatedClock';

class Trajectory extends React.Component {

  static defaultProps = {
    showPast: true,
    showFuture: true,
    pastHorizonSeconds: 45 * 60 ,
    futureHorizonSeconds: 45 * 60,
  }

  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      map: null,
      mapPastTrajectoryId: 'trajectory-past-' + uuidv4(),
      mapFutureTrajectoryId: 'trajectory-future-' + uuidv4(),
      animationRequestId: null,
    }
  }

  componentDidMount() {
    this.update();
  }

  componentWillUnmount() {
    if (!this.state.map) return;
    cancelAnimationFrame(this.state.animationRequestId);
    this.state.map.removeLayer(this.state.mapPastTrajectoryId);
    this.state.map.removeLayer(this.state.mapFutureTrajectoryId);
    this.state.map.removeSource(this.state.mapPastTrajectoryId);
    this.state.map.removeSource(this.state.mapFutureTrajectoryId);
  }

  maybeInitializeMap() {
    if (this.state.map) return;
    const map = this.props.getMap();
    if (!map) return;
    // https://github.com/mapbox/mapbox-gl-directions/issues/111
    if (!(map._loaded)) return;

    // unclear why this satement below is necessary. Seems like there is
    // a race condition happenning somehow.
    if (map.getSource(this.state.mapFutureTrajectoryId)) return;
    if (map.getSource(this.state.mapPastTrajectoryId)) return;

   // setup past trajectory
    map.addSource(this.state.mapPastTrajectoryId, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': [],
        }
      }
    });

    map.addLayer({
      'id': this.state.mapPastTrajectoryId,
      'type': 'line',
      'source': this.state.mapPastTrajectoryId,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round',
      },
      'paint': {
        'line-color': '#888',
        'line-width': 2,
        'line-opacity': 0.6,
      }
    }, 'offlineSatelliteLayer'); // Note: abstraction leak!

    // setup future trajectory
    map.addSource(this.state.mapFutureTrajectoryId, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': [],
        }
      }
    });

    map.addLayer({
      'id': this.state.mapFutureTrajectoryId,
      'type': 'line',
      'source': this.state.mapFutureTrajectoryId,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round',
      },
      'paint': {
        'line-color': '#888',
        'line-width': 2,
        'line-opacity': 0.2,
      }
    }, 'offlineSatelliteLayer'); // Note: abstraction leak!

    this.setState({map: map})
  }

  updatePastTrajectory() {
    if (!this.state.map) return;
    let trajectory = []
    let clock = new SimulatedClock(this.props.universe.clock().now());
    const step = -1 * 60 * 1000;
    const numSteps = Math.abs(this.props.pastHorizonSeconds * 1000 / step);
    let lastPos = null;
    for (let i = 0; i < numSteps; i += 1) {
      const pos = this.props.satellite.orbit().getPosition(clock);
      if (lastPos && pos.longitude > lastPos.longitude) {
        pos.longitude -= 360;
      }
      trajectory.push([pos.longitude, pos.latitude]);
      clock.advance(step);
      lastPos = pos;
    }
    trajectory = trajectory.reverse();
    this.state.map.getSource(this.state.mapPastTrajectoryId).setData({
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': trajectory,
      }
    }); 
  }

  updateFutureTrajectory() {
    if (!this.state.map) return;
    let trajectory = []
    let clock = new SimulatedClock(this.props.universe.clock().now());
    const step = 1 * 60 * 1000;
    const numSteps = Math.abs(this.props.pastHorizonSeconds * 1000 / step);
    let lastPos = null;
    for (let i = 0; i < numSteps; i += 1) {
      const pos = this.props.satellite.orbit().getPosition(clock);
      if (lastPos && pos.longitude < lastPos.longitude) {
        pos.longitude += 360;
      }
      trajectory.push([pos.longitude, pos.latitude]);
      clock.advance(step);
      lastPos = pos;
    }
    trajectory = trajectory.reverse();
    this.state.map.getSource(this.state.mapFutureTrajectoryId).setData({
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': trajectory,
      }
    }); 
  }

  update() {
    this.maybeInitializeMap();
    if (this.props.showPast) this.updatePastTrajectory();
    if (this.props.showFuture) this.updateFutureTrajectory();
    const animationRequestId = requestAnimationFrame(this.update.bind(this));
    this.setState({
      animationRequestId: animationRequestId,
    })
  }

  render() {
    return null;
  }

}

export default Trajectory
