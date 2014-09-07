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
    replace: true,
    link: function ($scope) {
    }
  };
}

angular
  .module('shotbyshot')
  .directive('slideManager', SlideManager);

