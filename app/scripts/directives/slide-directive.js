'use strict';

function Slide() {
  return {
    restrict: 'E',
    templateUrl: 'templates/slide.html',
    link: function ($scope, $element, $attrs) {
    }
  };
}

angular
  .module('shotbyshot')
  .directive('slide', Slide);
