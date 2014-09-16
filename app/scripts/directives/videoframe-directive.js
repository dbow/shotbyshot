'use strict';

/**
 * Directive displaying a screenshot from the current shot video at the
 * specified target frame (or the first frame).
 * Must be applied as an attribute on a <canvas> tag.
 */
function VideoFrame(VideoService) {
  return {
    restrict: 'A',
    scope: {
      target: '@'
    },
    link: function ($scope, $element, $attrs) {
      // Target frame timecode.
      var target = $scope.target || 0;
      var canvas = $element[0];
      var ctx = canvas.getContext('2d');

      // Draw the given screenshot into this canvas.
      var drawScreenshot = function(screenshot) {
        canvas.height = screenshot.height;
        canvas.width = screenshot.width;
        ctx.putImageData(screenshot, 0, 0, 0, 0,
            screenshot.width, screenshot.height);
      }

      VideoService.requestScreenshot(target, drawScreenshot);
    }
  };
}

angular
  .module('shotbyshot')
  .directive('videoFrame', VideoFrame);






