'use strict';

/**
 * Replaces .mp4 with the .webmhd.webm filetype.
 */
function WebMFilter(url) {
  return url.replace('.mp4', '.webmhd.webm');
}

angular
  .module('shotbyshot')
  .filter('webm', function() {
    return WebMFilter;
  });

