'use strict';

/**
 * Directive displaying a screenshot from the current shot video at the
 * specified target frame (or the first frame).
 * Must be applied as an attribute on a <canvas> tag.
 */
function VideoFrame(ShotService, VideoService) {
  return {
    restrict: 'A',
    scope: {
      target: '@'
    },
    link: function ($scope, $element, $attrs) {
      // Target frame timecode.
      var target = $scope.target || 0;
      console.log(target);
      var canvas = $element[0];
      var ctx = canvas.getContext('2d');

      // Draw the given screenshot into this canvas.
      var drawScreenshot = function(screenshot) {
        canvas.height = screenshot.height;
        canvas.width = screenshot.width;
        ctx.putImageData(screenshot, 0, 0, 0, 0,
            screenshot.width, screenshot.height);
      }

      // Check the shot service cache for screenshot data.
      if (ShotService.screenshots[target]) {
        drawScreenshot(ShotService.screenshots[target]);

      // Otherwise ask VideoService to get a screenshot of the shot video
      // at the specified timecode.
      } else {
        VideoService.screenshot(
            ShotService.videoUrl + (target ? '#t=' + target : ''),
            drawScreenshot);
      }
    }
  };
}

angular
  .module('shotbyshot')
  .directive('videoFrame', VideoFrame);






