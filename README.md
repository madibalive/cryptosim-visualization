# Cryptosim Visualization Library

This project is a visualization library for the [cryptosim](https://github.com/cryptosat/cryptosim) package written in ReactJS. It contains utilities for displaying on a map the live location of satellites, their trajectories, the locations of ground stations, The areas coveraged by the stations, and more.

## Installation

The library is published at the yarn online package index as [@cryptosat/cryptosim-visualization](https://yarnpkg.com/package/@cryptosat/cryptosim-visualization). To include it in your own project run:

    yarn install @cryptosat/cryptosim-visualization

## Usage

To visualize your configuration uses the following snippet:

    import { Map } from '@cryptosat/cryptosim-visualization';
    
    ...

    <Map universe={universe} gsnetwork={gsnetwork}>

where `universe` and `gsnetwork` are `Universe` and `GroundStationNetwork` instances of the [cryptosim](https://github.com/cryptosat/cryptosim) engine respectively.  The repository contains a standalone demo app. To check it out first clone this repository and then run:

    yarn install
    yarn start

This will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
