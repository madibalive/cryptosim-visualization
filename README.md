# Cryptosim Visualization Library

This project is a visualization library for the [cryptosim](https://github.com/cryptosat/cryptosim) package written in ReactJS. It contains utilities for displaying on a map the live location of satellites, their trajectories, the locations of ground stations, The areas coveraged by the stations, and more.

## Development

###Enforcing Node.js and npm versions
To ensure that all developers working on the project use compatible versions of Node.js and npm, check the engines field of your package.json file. This field specifies the minimum required version of Node.js and npm.

to require Node.js version 16.0.0 or later and npm version 8.0.0 or later.

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



## VIRTUAL ENVIRONMENT 

Steps you can follow to create a build environment and build Cryptosim Visualization:

Install a Linux virtual machine on your computer. You can use VirtualBox or VMware to do this.

Install the latest version of Node.js (currently version 16.19) on the virtual machine. You can download it from the official Node.js website: https://nodejs.org/en/download/

Clone the Cryptosim Visualization repository to your virtual machine using the following command:


git clone https://github.com/cryptosat/cryptosim-visualization.git
Navigate to the tutorial directory using the following command:
```
    cd tutorial
```


If you run into a memory error while building, you can try increasing the memory limit for Node.js. You can do this by setting the NODE_OPTIONS environment variable to --max_old_space_size=<memory limit> before running the yarn build command. For example, to set the memory limit to 4GB, you can use the following command:

```
    NODE_OPTIONS=--max_old_space_size=4096 yarn build
```