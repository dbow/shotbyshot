'use strict';

function ShotCtrl($scope, $sce, $filter, ShotService, AnnotationParserService,
                  ShotVideoService, ScrollService) {
  var self = this;

  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = ShotService.getVideoUrl();
  this.shots = [];
  this.menuIsOn = false;

  this.play = function() {
    self.playing = true;
    ShotVideoService.play();
  };

  ShotService.getShot(this.id).then(function(annotations) {
    var intro = [{
      type: 'introduction',
      shot: self.id,
      nav: 'introduction'
    },
    {
      type: 'shotvideo',
      shot: self.id,
      onEnter: function() {
        $scope.inView = true;
        if (!self.played) {
          self.playing = true;
          ShotVideoService.play();
          self.played = true;
        }
        $scope.$apply();
      },
      onExit: function() {
        $scope.inView = false;
        self.playing = false;
        ShotVideoService.resumeLoop();
        $scope.$apply();
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
  });

  // TODO: probably can lazy load this, but i'm not
  // angular enought to know how.
  ShotService.getThumbnails(0).then(function(thumbs) {
    self.thumbs = thumbs;
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
    return '/wp/wp-content/uploads/Shots_400px/' + shot.slug + '.png';
  };

  $scope.toggleMenu = function () {
    if (self.menuIsOn) {
      ShotVideoService.resumeLoop();
      angular.element(document.body).removeClass('noscroll');
    } else {
      ShotVideoService.pause();
      angular.element(document.body).addClass('noscroll');
    }
    self.menuIsOn = !self.menuIsOn;
    return self.menuIsOn;
  };
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
