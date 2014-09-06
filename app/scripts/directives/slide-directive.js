'use strict';

function Slide() {
  return {
    restrict: 'E',
    template: '',
    link: function ($scope, $element, $attrs) {
    }
  };
}

angular
  .module('shotbyshot')
  .directive('Slide', Slide);
