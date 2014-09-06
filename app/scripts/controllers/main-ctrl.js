'use strict';

angular.module('shotbyshot')
  .controller('MainCtrl', function ($scope) {
    var annotations = $scope.annotations = [
      {
        title: 'Annotation #1',
        content: 'This is an annotation.',
        y: 0
      },
      {
        title: 'Annotation #2',
        content: 'This is an annotation.',
        y: 1
      },
      {
        title: 'Annotation #3',
        content: 'This is an annotation.',
        y: 2
      },
    ];

  });
