'use strict';

/**
 */
function StreetView(StreetViewService) {
  return {
    restrict: 'E',
    templateUrl: 'templates/streetview.html',
    scope: {
      url: '@',
      caption: '@',
      title: '@'
    },
    link: function ($scope, $element, $attrs) {
      var size = window.innerWidth + 'x' + window.innerHeight;
      $scope.streetViewImageUrl = StreetViewService.buildStreetViewAPIUrl(
          StreetViewService.parseStreetViewUrl($scope.url, size));
    }
  };
}

angular
  .module('shotbyshot')
  .directive('streetView', StreetView);



