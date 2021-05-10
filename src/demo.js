import Satellite from 'cryptosim/lib/satellite';
import Universe from 'cryptosim/lib/universe';
import GroundStationNetwork from 'cryptosim/lib/groundStationNetwork';
import SimulatedClock from 'cryptosim/lib/clocks/simulatedClock';

const clock = new SimulatedClock(new Date(2021, 2, 1, 2, 30, 0, 0));
clock.setSpeed(100);
clock.play();
const universe = new Universe(clock);

const ISS_TLE = [
  '1 25544U 98067A   21027.77992426  .00003336  00000-0  68893-4 0  9991',
  '2 25544  51.6465 317.1909 0002399 302.6503 164.1536 15.48908950266831',
];

const sat1 = new Satellite(universe, 'crypto1', ISS_TLE[0], ISS_TLE[1]);
const gsnetwork = GroundStationNetwork.load(
    universe, require('cryptosim/data/rbcNetwork'));

// Make variables accessable to console for debugging
window.universe = universe;
window.gsnetwork = gsnetwork;
window.sat = sat1;

export {universe, gsnetwork};
