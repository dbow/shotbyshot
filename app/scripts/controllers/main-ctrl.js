'use strict';

angular.module('shotbyshot')
  .controller('MainCtrl', function ($scope) {
    var shot = {};
    shot.annotations = [
      {
        src: 'http://cf.lossur.es/home/HOME01',
        title: 'Living Los Sures',
        description: 'An expansive documentary project about the Southside neighborhood of Williamsburg, Brooklyn.',
        subtitle: 'In four parts'
      },
      {
        src: 'http://cf.lossur.es/home/HOME02',
        title: 'Los Sures [1984]',
        description: 'Diego Echeverria\'s film, now restored, following the story of five members from Southside community.',
        subtitle: 'Coming Soon.'
      },
    ];

    shot.slides = [];
    _.each(shot.annotations, function (annotation) {
      shot.slides.push({
        type: 'bg-video',
        nav: annotation.title,
        attributes: {
          video: [
            annotation.src + '.mp4',
            annotation.src + '.webmhd.webm'
          ]
        },
        annotation: annotation
      });
      shot.slides.push({
        type: 'main-title',
        nav: annotation.title,
        attributes: annotation,
        annotation: annotation
      });
    });

    $scope.shot = shot;

    $scope.isNavSlide = function(slide) {
      var NAV_TYPES = [
        'main-title'
      ];
      return _.contains(NAV_TYPES, slide.type);
    };

    $scope.isHeaderSlide = function(slide) {
      var NAV_TYPES = [
        'bg-video'
      ];
      return _.contains(NAV_TYPES, slide.type);
    };

    console.log(shot.slides);

  });
