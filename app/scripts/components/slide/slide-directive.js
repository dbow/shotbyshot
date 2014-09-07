'use strict';

function Slide() {
  return {
    restrict: 'E',
    templateUrl: 'scripts/components/slide/slide.html',
    scope: {
      slide: '=data'
    },
    link: function ($scope, $element, $attrs) {
    }
  };
}

angular
  .module('shotbyshot')
  .directive('slide', Slide);
