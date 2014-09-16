'use strict';

/**
 *
 */
function shotVideoDirective(VideoService) {
  return {
    /**
     * Must be a class since this depends on CSS classes.
     * Named class="shot-video-directive" to differentiate class-based
     * directive from normal CSS.
     */
    restrict: 'C',
    link: function ($scope, $element, $attrs) {
      var video = $element[0];

      // Set playback to 20% speed.
      video.playbackRate = 0.3;

      function checkForScreenshot() {
        // Check if we need a screenshot of the current frame.
        var time = parseFloat(video.currentTime.toFixed(1));
        if (screenshotsToTake[time]) {
          VideoService.screenshot(video, time);
          delete screenshotsToTake[time];

          // Check if we're done with all the screenshots we need.
          var codesLeft = false;
          _.forIn(screenshotsToTake, function(val, code) {
            if (val) {
              codesLeft = true;
              return false;
            }
          });
          // If we are, stop listening.
          if (!codesLeft) {
            video.removeEventListener('timeupdate', checkForScreenshot);
            screenshotsToTake = false;
          }
        }
      }

      // Create a map of timecode to screenshot data.
      VideoService.screenshots = VideoService.screenshots || {};
      var screenshotsToTake;

      // Identify timecodes that we'll need screenshots of (all annotations
      // that have a start timecode.
      $scope.$watch('shot.annotations', function() {
        screenshotsToTake = false;
        _.forEach($scope.shot.annotations, function(annotation) {
          var timecodes = annotation.timecodes;
          var hasStart = timecodes && timecodes.start !== undefined;
          if (hasStart &&
              !VideoService.screenshotTaken(video, timecodes.start)) {
            screenshotsToTake = screenshotsToTake || {};
            screenshotsToTake[timecodes.start] = 1;
          }
        });

        // Anytime this video changes frame, check if we should take a screenshot.
        if (screenshotsToTake) {
          video.addEventListener('timeupdate', checkForScreenshot);
        }
      });
    }
  };
}

angular
  .module('shotbyshot')
  .directive('shotVideoDirective', shotVideoDirective);


