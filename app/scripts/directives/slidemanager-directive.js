'use strict';

/**
 *
 */
function SlideManager() {
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
      // Reference to the container element - can query for slide children.
      console.log(angular.element($element));

      $scope.$watch('slides', function(newValue, oldValue) {
        // Array of slide DIVs.
        console.log($scope.slides);
      });
    }
  };
}

angular
  .module('shotbyshot')
  .directive('slideManager', SlideManager);

