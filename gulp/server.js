'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');
var url = require('url');
var proxy = require('proxy-middleware');

// Use proxy-middleware instead of http-proxy because http-proxy was causing
// an issue with the dreamhost server and I couldn't figure it out :/
// Probably something with specific headers. proxy-middleware just works though.
var proxyOptions = url.parse('http://www.memory.lossur.es/wp/');
proxyOptions.route = '/api';

function browserSyncInit(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;

  browserSync.instance = browserSync.init(files, {
    startPath: '/index.html',
    port: 8080,
    server: {
      baseDir: baseDir,
      middleware: proxy(proxyOptions)
    },
    browser: browser
  });

}

gulp.task('serve', ['watch'], function () {
  browserSyncInit([
    'app',
    '.tmp'
  ], [
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/partials/**/*.html',
    'app/images/**/*'
  ]);
});

gulp.task('serve:dist', ['build'], function () {
  browserSyncInit('dist');
});

gulp.task('serve:e2e', function () {
  browserSyncInit(['app', '.tmp'], null, []);
});

gulp.task('serve:e2e-dist', ['watch'], function () {
  browserSyncInit('dist', null, []);
});
