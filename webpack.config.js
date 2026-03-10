const path = require('path');

let webpack = require('vortex-api/bin/webpack').default;

module.exports = webpack('game-terraria', __dirname, 5);