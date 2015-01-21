'use strict';

function ShotCtrl($scope, $sce, $filter, $timeout, ShotService,
                  AnnotationParserService, ShotVideoService, ScrollService,
                  AnalyticsService) {
  var self = this;


  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = ShotService.getVideoUrl();
  this.shots = [];
  this.thumbsForTag = {};

  AnalyticsService.pageview(window.location.href,
      document.title + ' - Shot ' + this.id);

  $scope.menuIsOn = false;
  $scope.showMenuTab = 'shots';

  angular.element(document.body).removeClass('noscroll');

  this.play = function() {
    self.backgroundOpacity = 0;
    self.playing = true;
    ShotVideoService.play(self.stop);
  };

  this.stop = function() {
    self.playing = false;
    ShotVideoService.resumeLoop();
    self.backgroundOpacity = 1;
    $scope.$apply();
  };

  if (this.id) {
    ShotService.getShot(this.id).then(function(annotations) {
      var intro = [{
        type: 'introduction',
        shot: self.id,
        nav: 'introduction',
        onEnter: function() {
          $scope.inView = true;
          if (!self.played) {
            $timeout(function() {
              self.play();
              self.played = true;
            }, 3000);
          }
          $scope.$apply();
        },
        onExit: function() {
          $scope.inView = false;
          self.stop();
        }
      }];
      var outro = [{
        shot: self.id,
        type: 'outro',
        next: self.next
      }];
      var slides = intro.concat(AnnotationParserService.parse(annotations), outro);
      self.annotations = annotations;
      self.slides = slides;
      _.each(slides, function (slide) {
        slide.isNav = $scope.isNavSlide(slide);
        slide.isHeader = $scope.isHeaderSlide(slide);
      });
    });
  } else {
    self.slides = [
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
      {
        type: 'main-title',
        attributes: {
          content: 'Living Los Sures'
        },
        annotation: {
          src: 'cf.lossur.es/home/HOME01',
          title: 'Living Los Sures',
          content: 'An expansive documentary project about the Southside neighborhood of Williamsburg, Brooklyn. In five parts.',
          subtitle: 'In four parts'
        }
      },
    ];
  }

  // TODO: probably can lazy load this, but i'm not
  // angular enought to know how.
  ShotService.getThumbnails(0).then(function(thumbs) {
    $scope.thumbs = self.thumbs = thumbs;

    // Scroll the shot menu to approximately the location of this shot.
    var thisShotIndex = _.findIndex(thumbs, function(thumb) {
      return parseInt(thumb.slug, 10) === self.id;
    });
    var thumbnailRowHeight = 275; // constant px height from CSS...
    var scrollTarget = thumbnailRowHeight * Math.floor(thisShotIndex / 2);
    $timeout(function() { // Scroll 300ms later to allow for rendering.
      document.querySelector('.nav-menu-shots').scrollTop = scrollTarget;
    }, 300);
  });

  ShotService.getTags(0).then(function(tags) {
    self.tags = _.map(_.sortBy(tags, function (tag) {
      return -tag.post_count;
    }).slice(0, 30), function(sortedTag) {
      sortedTag.title = sortedTag.title.replace(/\s/g, '&nbsp;');
      return sortedTag;
    });
  });

  $scope.isHeaderSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'outro',
      'author',
      'photo',
      'video',
      'streetview',
      'bg-video'
    ];
    return _.contains(NAV_TYPES, slide.type);
  };

  $scope.isNavSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'author',
      'photo',
      'video',
      'streetview',
      'main-title'
    ];
    return _.contains(NAV_TYPES, slide.type);
  };

  $scope.scrollToSlide = function (slide) {
    // TODO: ask Danny if this is kosher
    ScrollService.scrollToSlide(slide);
  };

  $scope.thumbnailForShot = function (shot) {
    return '/wp/wp-content/uploads/Shots_400px/' + shot.slug + '.png';
  };

  $scope.toggleMenu = function () {
    if ($scope.menuIsOn) {
      ShotVideoService.resumeLoop();
      angular.element(document.body).removeClass('noscroll');
    } else {
      ShotVideoService.pause();
      angular.element(document.body).addClass('noscroll');
    }
    $scope.menuIsOn = !$scope.menuIsOn;
  };

  $scope.toggleGlobalMenu = function () {
    if ($scope.globalIsOn) {
      ShotVideoService.resumeLoop();
      angular.element(document.body).removeClass('noscroll');
    } else {
      ShotVideoService.pause();
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
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
