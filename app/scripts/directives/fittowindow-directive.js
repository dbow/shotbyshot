'use strict';

/**
 */
function FitToWindowDirective($timeout, $window) {
  return {
    /**
     * Must be a class since this depends on CSS classes.
     * Named class="fit-to-window-directive" to differentiate class-based
     * directive from normal CSS.
     */
    restrict: 'C',
    priority: -1, // Execute last.
    link: function ($scope, $element, $attrs) {
      var el = $element[0];
      var isContainer = $attrs.ngBindHtml;

      function checkSize() {
        var windowAspectRatio = $window.innerWidth / $window.innerHeight;
        var toFill = 'height';
        var height;
        var width;
        var img;
        if (isContainer) {
          img = $element.find('IMG')[0];
          height = img && img.height;
          width = img && img.width;
        } else if (el.tagName === 'VIDEO') {
          height = el.videoHeight;
          width = el.videoWidth;
        } else if (el.tagName === 'IMG') {
          height = el.height;
          width = el.width;
        }
        if (height && width) {
          if (width / height > windowAspectRatio) {
            $attrs.$addClass('fit-to-window-width-directive');
          } else {
            $attrs.$removeClass('fit-to-window-width-directive');
          }
          if (isContainer) {
            $element.find('IMG').off('load', checkSize);
          } else {
            $element.off('load', checkSize);
          }
        }
      }

      if (isContainer) {
        // We only expect <img> dynamically added - video will be iframes.
        $scope.$watch('ngBindHtml', function() {
          $timeout(function() {
            $element.find('IMG').on('load', checkSize);
            checkSize();
          }, 50);
        });
      } else {
        $element.on('load', checkSize);
      }

      checkSize();

      // Update on resize (debounced).
      angular.element($window).on('resize', _.debounce(checkSize, 150));
    }
  };
}

angular
  .module('shotbyshot')
  .directive('fitToWindowDirective', FitToWindowDirective);


