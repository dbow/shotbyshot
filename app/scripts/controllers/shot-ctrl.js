'use strict';

function ShotCtrl($scope, $stateParams, $http, $sce) {
  var shotId = parseInt($stateParams.shot, 10);

  function convertToShot(num) {
    return ('0000' + num).slice(-4);
  }

  this.id = convertToShot(shotId);
  this.next = convertToShot(shotId + 1);
  this.previous = convertToShot(shotId - 1);

  this.videoUrl = $sce.trustAsResourceUrl(
      '//memory.lossur.es/wp/wp-content/uploads/shots/' + this.id + '.mp4');

  var url = '/api/?json=get_category_posts&post_type=mm_annotation&slug=' +
      this.id;
  var self = this;
  $http({
      method: 'GET',
      url: url
    }).success(function(data, status, headers, config) {
      self.annotations = data.posts;
    }).error(function(data, status, headers, config) {
    });
}

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
