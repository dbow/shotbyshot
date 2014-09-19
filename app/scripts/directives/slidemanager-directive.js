'use strict';

/**
 *
 */
function SlideManager(ScrollService) {
  return {
    restrict: 'E',
    template: [
          '<slide ng-repeat="slide in slides" data="slide">' +
          '</slide>'
        ].join(''),
    scope: {
      slides: '=?',
    },
    link: function ($scope, $element) {
      ScrollService.init({el: $element});

      $scope.$watch('slides', function(newValue, oldValue) {
        ScrollService.setSlides($scope.slides);
      });
    }
  };
}

angular
  .module('shotbyshot')
  .directive('slideManager', SlideManager);

