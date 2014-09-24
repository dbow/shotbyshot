'use strict';

/**
 * Directive in charge of interfacing with the various forms of video content.
 * Supports HTML5, vimeo, and youtube. Provides facade functions that handle
 * the nuances of each implementation.
 */
function VideoContainer($rootScope) {
  return {
    restrict: 'A',
    link: function ($scope, $element, $attrs) {
      var el = $element[0];
      var $el = angular.element(el);
      var videoSlide = $scope.slide;
      var videoType = '';
      var played = false;

      function getVideoElement() {
        var videoEl;
        switch(videoType) {
          case 'html5':
            videoEl = $element.find('video')[0];
            break;
          case 'vimeo':
            videoEl = $element.find('iframe')[0];
            break;
          case 'youtube':
            videoEl = $element.find('iframe')[0];
            break;
        }
        return videoEl;
      }

      // Identify which type of video this is based on the attribute/content.
      if (videoSlide.attributes.video) {
        videoType = 'html5';
      } else if (videoSlide.annotation.content.indexOf('vimeo') >= 0) {
        videoType = 'vimeo';
      } else if (videoSlide.annotation.content.indexOf('youtube') >= 0) {
        videoType = 'youtube';
      }

      /** Attempting hover but not really working. Should just build our
       *  own custom controls and use CSS to show/hide.
      $el.on('mouseenter', function(e) {
        var videoEl = getVideoElement();
        if (videoEl) {
          if (videoType === 'html5' && e.target.tagName === 'VIDEO') {
            videoEl.controls = true;
          }
        }
      });
      $el.on('mouseleave', function(e) {
        var videoEl = getVideoElement();
        if (videoEl) {
          if (videoType === 'html5') {
            videoEl.controls = false;
          }
        }
      });
      */


      // TODO(dbow): Right now this only supports HTML5, and does not support
      //   custom controls.
      //
      // Implement
      //   youtube iframe API: https://developers.google.com/youtube/iframe_api_reference
      //   vimeo embed API: http://developer.vimeo.com/apis/oembed

      $rootScope.$on('videoEnter', function(e, slide) {
        var el;
        if (slide === videoSlide) {
          if (videoType === 'html5' && !played) {
            getVideoElement().play();
            played = true;
          }
        }
      });

      $rootScope.$on('videoExit', function(e, slide) {
        if (slide === videoSlide) {
          if (videoType === 'html5') {
            var videoEl = getVideoElement();
            videoEl.pause();
          }
        }
      });
    }
  };
}

angular
  .module('shotbyshot')
  .directive('videoContainer', VideoContainer);







