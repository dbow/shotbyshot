'use strict';

/**
 *
 */
function shotVideoDirective(ShotService, VideoService) {
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

      // Create a map of timecode to screenshot data.
      ShotService.screenshots = ShotService.screenshots || {};
      var screenshots = ShotService.screenshots;

      // Identify timecodes that we'll need screenshots of (all annotations
      // that have a start timecode.
      $scope.$watch('shot.annotations', function() {
        _.forEach($scope.shot.annotations, function(annotation) {
          var timecodes = annotation.timecodes;
          var hasStart = timecodes && timecodes.start !== undefined;
          if (hasStart) {
            screenshots[timecodes.start] = screenshots[timecodes.start] || '';
          }
        });
      });

      function checkForScreenshot() {
        // Check if we need a screenshot of the current frame.
        var time = parseFloat(video.currentTime.toFixed(1));
        if (screenshots[time] === '') {
          screenshots[time] = VideoService.screenshot(video);
        }

        // Check if we're done with all the screenshots we need.
        if (screenshots[time]) {
          var codesLeft = false;
          _.forIn(screenshots, function(val, code) {
            if (val === '') {
              codesLeft = true;
              return false;
            }
          });
          // If we are, stop listening.
          if (!codesLeft) {
            video.removeEventListener('timeupdate', checkForScreenshot);
          }
        }
      }

      // Anytime this video changes frame, check if we should take a screenshot.
      video.addEventListener('timeupdate', checkForScreenshot);
    }
  };
}

angular
  .module('shotbyshot')
  .directive('shotVideoDirective', shotVideoDirective);


