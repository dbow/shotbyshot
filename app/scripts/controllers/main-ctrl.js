'use strict';

angular.module('shotbyshot')
  .controller('MainCtrl', function ($scope) {
    var slides = $scope.slides = [
      {
        type: 'bg-video',
        nav: 'Living Los Sures',
        attributes: {
          video: [
            'http://cf.lossur.es/home/HOME01.mp4',
            'http://cf.lossur.es/home/HOME01.webmhd.webm'
          ]
        },
        annotation: {
          src: 'cf.lossur.es/home/HOME01',
          title: 'Living Los Sures',
          content: 'An expansive documentary project about the Southside neighborhood of Williamsburg, Brooklyn. In five parts.',
          subtitle: 'In four parts'
        }
      },
    ];

  });
