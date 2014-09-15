'use strict';

/**
 *
 */
function StreetView(StreetViewService) {
  return {
    restrict: 'E',
    templateUrl: 'templates/streetview.html',
    scope: {
      url: '@',
      caption: '@',
      title: '@',
      startFrame: '@'
    },
    link: function ($scope, $element, $attrs) {
      // Assemble street view image URL.
      var size = window.innerWidth + 'x' + window.innerHeight;
      var streetViewParams = StreetViewService.parseStreetViewUrl(
          $scope.url, size);
      $scope.streetViewImageUrl = StreetViewService.buildStreetViewAPIUrl(
          streetViewParams);

      // Whether to show "one-up" version.
      $scope.onUp = false;

      $scope.goToStreetView = function() {
      };
    }
  };
}

angular
  .module('shotbyshot')
  .directive('streetView', StreetView);



