'use strict';

const { series } = require('gulp');

const { clean, build } = require('./gulp/build.js');
const server = require('./gulp/server.js');
const { watch } = require('./gulp/watch.js');

exports.default = series(clean, build);
exports.clean = clean;
exports.watch = watch;
exports.serve = server.serve;
exports['serve:4Real'] = server['serve:4Real'];
exports['serve:4RealDist'] = server['serve:4RealDist'];
exports['serve:dist'] = server['serve:dist'];
