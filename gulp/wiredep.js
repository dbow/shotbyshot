'use strict';

var gulp = require('gulp');

// inject bower components
exports.wiredep = function wiredep () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
        directory: 'app/bower_components'
    }))
    .pipe(gulp.dest('app/styles'));

  return gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'app/bower_components',
      exclude: []
    }))
    .pipe(gulp.dest('app'));
};
