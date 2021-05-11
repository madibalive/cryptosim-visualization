import React from 'react';
import './SatelliteInfoBar.css'

class SatelliteInfoBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      online: 'false',
      position: this.props.satellite.getPosition(),
      closestStation: null
    };
  }

  componentDidMount() {
    this.update();
  }

  update() {
    this.setState({
      position: this.props.satellite.getPosition(),
      online: this.props.gsnetwork.visibleStations(this.props.satellite).length > 0 ? 'true': 'false',
      closestStation: this.props.gsnetwork.closestTo(this.props.satellite),
    });
    requestAnimationFrame(this.update.bind(this));
  }

  render() {
    const pos = this.state.position;
    const online = this.state.online;
    let station = 'N/A';
    let elevation = 'N/A';
    let distance = 'N/A';
    let azimuth = 'N/A';
    if (this.state.closestStation != null) {
      station = this.state.closestStation.id();
      const angle = this.state.closestStation.angleTo(this.props.satellite);
      elevation = angle.elevation.toFixed(4);
      azimuth = angle.azimuth.toFixed(4);
      distance = angle.distance.toFixed(4);
    }


    return (
      <div className='satellite-info-bar'>
        <table>
          <tbody>
            <tr><td className='title'>Longitude:</td><td className='value'>{pos.longitude.toFixed(4)}</td></tr>
            <tr><td className='title'>Latitude:</td><td className='value'>{pos.latitude.toFixed(5)}</td></tr>
            <tr><td className='title'>Altitude:</td><td className='value'>{pos.altitude.toFixed(5)}</td></tr>
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
}

export default SatelliteInfoBar;
