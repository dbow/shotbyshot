'use strict';

function ShotCtrl($scope, $sce, $filter, ShotService, AnnotationParserService) {
  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = $sce.trustAsResourceUrl(
      '//memory.lossur.es/wp/wp-content/uploads/shots/' +
      $filter('shot')(this.id) + '.mp4');
  var self = this;
  ShotService.getShot(this.id).then(function(annotations) {
    var intro = [{
      type: 'introduction',
      shot: self.id
    },
    {
      type: 'shotvideo',
      shot: self.id
    }];
    var slides = intro.concat(AnnotationParserService.parse(annotations));
    self.annotations = annotations;
    self.slides = slides;
  });
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
