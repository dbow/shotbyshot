'use strict';

var gulp = require('gulp');

gulp.task('watch', ['wiredep', 'styles'] ,function () {
  gulp.watch(['app/styles/**/*.scss',
              'app/scripts/components/**/*.scss'], ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});
