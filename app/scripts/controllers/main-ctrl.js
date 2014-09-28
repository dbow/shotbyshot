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
      {
        src: 'http://cf.lossur.es/home/HOME03',
        title: 'Shot by Shot',
        description: 'The film from 1984, dismantled shot by shot, so longstanding residents of Los Sures can splice in their own stories.',
        play: true,
      },
      {
        src: 'http://cf.lossur.es/home/HOME04',
        title: '89 Steps',
        description: 'An interactive story about Marta, one of the primary voices from the film, as she contemplates leaving the neighborhood.',
        play: true,
      },
      {
        src: 'http://cf.lossur.es/home/HOME05',
        title: 'Southside Short Docs',
        description: 'A collection of award-winning short documentaries inspired by the film from 1984 and the neighborhood today.',
        play: true,
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
