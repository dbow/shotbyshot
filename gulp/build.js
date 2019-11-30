'use strict';

var gulp = require('gulp');

var templateCache = require('gulp-angular-templatecache');
const htmlmin = require('gulp-htmlmin');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license']
});

function styles() {
  return gulp.src('app/styles/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size());
}

function scripts () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.size());
}

function partials() {
  return gulp.src('app/partials/**/*.html')
    .pipe(htmlmin())
    .pipe($.ngHtml2js({
      moduleName: 'shotbyshot',
      prefix: 'partials/'
    }))
    .pipe(gulp.dest('.tmp/partials'))
    .pipe($.size());
}

function templates() {
  return gulp.src('app/templates/**/*.html')
      .pipe(templateCache({
        module: 'shotbyshot',
        root: 'templates/',
      }))
      .pipe(gulp.dest('dist/templates'));

}

const html = gulp.series(gulp.parallel(styles, scripts, partials, templates), function html () {
  var jsFilter = $.filter('**/*.js', { restore: true });
  var cssFilter = $.filter('**/*.css', { restore: true });
  var htmlFilter = $.filter(['**/*', '!**/*.html'], { restore: true });

  return gulp.src('app/*.html')
    .pipe($.inject(gulp.src('.tmp/partials/**/*.js'), {
      read: false,
      starttag: '<!-- inject:partials -->',
      addRootSlash: false,
      addPrefix: '../'
    }))
    .pipe($.inject(gulp.src('dist/templates/*.js'), {
      read: false,
      starttag: '<!-- inject:templates -->',
      ignorePath: 'dist',
      addRootSlash: false
    }))
    .pipe($.useref())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.replace('bower_components/bootstrap-sass-official/vendor/assets/fonts/bootstrap','fonts'))
    .pipe($.csso())
    .pipe(cssFilter.restore)
    .pipe(htmlFilter)
    .pipe($.rev())
    .pipe(htmlFilter.restore)
    .pipe($.revReplace())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

function images() {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
}

function clear () {
    return $.cache.clearAll();
}

function fonts() {
  var fontPaths = $.mainBowerFiles();
  fontPaths.push('app/fonts/**/*');
  return gulp.src(fontPaths)
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
}

function clean () {
  return gulp.src(['.tmp', 'dist'], { read: false, allowEmpty: true }).pipe($.rimraf());
}

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;

exports.build = gulp.parallel(
  html,
  images,
  fonts
);

