'use strict';

function ShotCtrl($scope, $sce, $filter, ShotService) {
  this.id = ShotService.current;
  this.next = ShotService.getNext();
  this.previous = ShotService.getPrevious();
  this.videoUrl = $sce.trustAsResourceUrl(
      '//memory.lossur.es/wp/wp-content/uploads/shots/' +
      $filter('shot')(this.id) + '.mp4');
  var self = this;
  ShotService.getShot(this.id).then(function(annotations) {
    self.annotations = annotations;
  });
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
