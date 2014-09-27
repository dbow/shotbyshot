'use strict';

function ShotCtrl($scope, $sce, $filter, $timeout, ShotService,
                  AnnotationParserService, ShotVideoService, ScrollService) {
  var self = this;

  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = ShotService.getVideoUrl();
  this.shots = [];
  this.thumbsForTag = {};

  $scope.menuIsOn = false;
  $scope.showMenuTab = 'shots';

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
    console.log('slides', slides);
  });

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

  $scope.isHeaderSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'outro',
      'author',
      'photo',
      'video',
      'streetview'
    ];
    return _.contains(NAV_TYPES, slide.type);
  };

  $scope.isNavSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'author',
      'photo',
      'video',
      'streetview'
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
