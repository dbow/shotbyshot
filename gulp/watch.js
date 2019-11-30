'use strict';

var gulp = require('gulp');

const { wiredep } = require('./wiredep.js');
const { styles, scripts, images } = require('./build.js');

exports.watch = gulp.series(gulp.parallel(wiredep, styles), function watch(cb) {
  gulp.watch(['app/styles/**/*.scss',
              'app/scripts/components/**/*.scss'], styles);
  gulp.watch('app/scripts/**/*.js', scripts);
  gulp.watch('app/images/**/*', images);
  gulp.watch('bower.json', wiredep);
  cb();
});
