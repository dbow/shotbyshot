'use strict';

/**
 */
function shotVideoDirective() {
  return {
    /**
     * Must be a class since this depends on CSS classes.
     * Named class="shot-video-directive" to differentiate class-based
     * directive from normal CSS.
     */
    restrict: 'C',
    link: function ($scope, $element, $attrs) {
      // Set playback to 20% speed.
      $element[0].playbackRate = 0.3;
    }
  };
}

angular
  .module('shotbyshot')
  .directive('shotVideoDirective', shotVideoDirective);


