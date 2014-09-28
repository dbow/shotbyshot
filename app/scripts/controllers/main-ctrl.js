'use strict';

angular.module('shotbyshot')
  .controller('MainCtrl', function ($scope, $sce, $filter, ScrollService, ShotService) {
    this.shots = [];
    this.thumbsForTag = {};

    $scope.menuIsOn = false;
    $scope.showMenuTab = 'shots';

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
        href: '#/shot/0001',
      },
      {
        src: 'http://cf.lossur.es/home/HOME04',
        title: '89 Steps',
        description: 'An interactive story about Marta, one of the primary voices from the film, as she contemplates leaving the neighborhood.',
        href: 'http://89.lossur.es',
      },
      {
        src: 'http://cf.lossur.es/home/HOME05',
        title: 'Southside Short Docs',
        description: 'A collection of award-winning short documentaries inspired by the film from 1984 and the neighborhood today.',
        href: 'http://lossur.es/short-docs/',
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
        annotation: annotation,
        isHeader: true
      });
      shot.slides.push({
        type: 'main-title',
        nav: annotation.title,
        attributes: annotation,
        annotation: annotation,
        isNav: true
      });
    });

    $scope.shot = shot;

  // TODO: probably can lazy load this, but i'm not
  // angular enought to know how.
  ShotService.getThumbnails(0).then(function(thumbs) {
    $scope.thumbs = self.thumbs = thumbs;
  });

  ShotService.getTags(0).then(function(tags) {
    self.tags = _.sortBy(tags, function (tag) {
      return -tag.post_count;
    }).slice(0, 30);
  });


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

    $scope.scrollToSlide = function (slide) {
      // TODO: ask Danny if this is kosher
      ScrollService.scrollToSlide(slide);
    };

  $scope.thumbnailForShot = function (shot) {
    return '/wp/wp-content/uploads/Shots_400px/' + $filter('shot')(parseInt(shot.slug, 10) + 1) + '.png';
  };

  $scope.toggleMenu = function () {
    if ($scope.menuIsOn) {
      angular.element(document.body).removeClass('noscroll');
    } else {
      angular.element(document.body).addClass('noscroll');
    }
    $scope.menuIsOn = !$scope.menuIsOn;
  };

  $scope.toggleGlobalMenu = function () {
    if ($scope.globalIsOn) {
      angular.element(document.body).removeClass('noscroll');
    } else {
      angular.element(document.body).addClass('noscroll');
    }
    $scope.globalIsOn = !$scope.globalIsOn;
  };

  $scope.filterShots = function (tag) {
    if (!tag) {
      $scope.thumbs = self.thumbs;
    } else if (self.thumbsForTag[tag.id]) {
      $scope.thumbs = self.thumbsForTag[tag.id];
    } else {
      ShotService.getAnnotationsForTag(tag, 0).then(function(annotations) {
        var shots = {};
        var thumbs = [];
        _.each(annotations, function (annotation) {
          if (annotation.categories.length) {
            shots[annotation.categories[0].id] = annotation.categories[0];
          }
        });
        $scope.thumbs = self.thumbsForTag[tag.id] = _.toArray(shots);
      });
    }
  };
    console.log(shot.slides);

  });
