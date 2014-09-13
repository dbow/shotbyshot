'use strict';

/**
 * Scales an image to fill the screen without distorting / changing the aspect
 * ratio.
 *
 * Should be applied to either an <img> tag or a <div ng-bind-html> that will
 * load content with an <img> tag.
 */
function BackgroundCoverDirective($timeout) {
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
      function checkImage() {
        var img = $element[0].tagName === 'IMG' ? $element[0] :
            $element.find('IMG')[0];
        if (img && img.height && img.width) {
          var windowAspectRatio = window.innerWidth / window.innerHeight;
          if (img.width / img.height > windowAspectRatio) {
            $attrs.$addClass('fill-height-directive');
          }
          // Remove listeners.
          if ($element[0].tagName === 'IMG') {
            $element.off('load', checkImage);
          } else {
            $element.find('IMG').off('load', checkImage);
          }
          return true;
        } else {
          return false;
        }
      }

      // See if an image is already loaded.
      if (!checkImage()) {
        if ($element[0].tagName === 'IMG') {
          // Wait for the element to load if it's an <img> to check again.
          $element.on('load', checkImage);
        } else if ($attrs.ngBindHtml) {
          // Otherwise wait for HTML to be populated and then wait for any
          // <img> tag within to load to check again.
          $scope.$watch('ngBindHtml', function() {
            // Give HTML a chance to load.
            $timeout(function() {
              if (!checkImage()) {
                $element.find('IMG').on('load', checkImage);
              }
            }, 50);
          });
        }
      }
    }
  };
}

angular
  .module('shotbyshot')
  .directive('backgroundCoverDirective', BackgroundCoverDirective);

