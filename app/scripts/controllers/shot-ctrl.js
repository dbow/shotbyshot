'use strict';

function ShotCtrl($scope, $sce, $filter, ShotService, AnnotationParserService,
                  ShotVideoService) {
  var self = this;

  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = ShotService.getVideoUrl();

  ShotService.getShot(this.id).then(function(annotations) {
    var intro = [{
      type: 'introduction',
      shot: self.id,
      nav: 'introduction'
    },
    {
      type: 'shotvideo',
      shot: self.id,
      onEnter: ShotVideoService.play,
      onExit: ShotVideoService.resumeLoop
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

  $scope.isNavSlide = function(slide) {
    var NAV_TYPES = [
      'introduction',
      'outro',
      'author',
      'photo',
      'video',
      'streetview'
    ];
    for (var i = 0, len = NAV_TYPES.length; i < len; i++) {
      if (slide.type === NAV_TYPES[i]) {
        return true;
      }
    }
    return false;
  };

  $scope.scrollToSlide = function (slide) {
    // TODO: ask Danny if this is kosher
    Scroller.scrollToSlide(slide);
  }
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
