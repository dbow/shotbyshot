'use strict';

/**
 * Scales an image to fill the screen without distorting / changing the aspect
 * ratio.
 *
 * Should be applied to either an <img> tag or a <div ng-bind-html> that will
 * load content with an <img> tag.
 */
function VideoCoverDirective($timeout, $window) {
  return {
    /**
     * Must be a class since this depends on CSS classes.
     * Named class="background-cover-directive" to differentiate class-based
     * directive from normal CSS.
     */
    restrict: 'C',
    priority: -1, // Execute last.
    link: function ($scope, $element, $attrs) {
      /**
       * Checks an image to see if it needs to be adjusted to fill the screen.
       * Images default to 100% width with no limit on height. This function
       * checks to see if the image's aspect ratio is greater than the
       * window's. If so, adds a class that will make it 100% height with no
       * limit on width. If an image with height and width cannot be found
       * returns false so we can check again.
       */
      function check() {
        var video = $element[0];

        if (video && video.height && video.width) {
          var windowAspectRatio = window.innerWidth / window.innerHeight;
          if (video.width / video.height > windowAspectRatio) {
            $attrs.$addClass('fill-height-directive');
          }
          $element.off('loadedmetadata', check);
          return true;
        }
        return false;
      }

      // See if an image is already loaded.
      if (!check()) {
        $element.on('loadedmetadata', check);
      }

      // Update on resize (debounced).
      angular.element($window).on('resize', _.debounce(check, 150));
    }
  };
}

angular
  .module('shotbyshot')
  .directive('videoCoverDirective', VideoCoverDirective);


