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
    setTimeout(function () {
      Scroller.init();
    }, 100);
  });
}

var Scroller = {
  init: function () {
    this.annotationInfo = [];
    this.height = window.innerHeight;
    this.navHeight = 80;

    this.headers = document.getElementsByClassName('top-nav-author');
    this.annotationDivs = document.getElementsByClassName('annotation');

    this.sizeAndPosition();

    angular.forEach(this.annotationDivs, function (annotation, i) {
      this.annotationInfo.push({
        index: i,
        top: annotation.offsetTop,
        height: annotation.offsetHeight,
        bottom: annotation.offsetTop + annotation.offsetHeight,
        header: angular.element(this.headers[i]),
        el: angular.element(annotation)
      });
      //annotation.style.top = (i * Scroller.height) + 'px';
    }, this);

    this.currentAnnotation = this.annotationInfo[0];
    this.currentAnnotation.header.removeClass('down');

    //window.addEventListener('scroll', angular.bind(this, this.onscroll));
    window.addEventListener('resize', angular.bind(this, this.sizeAndPosition));

    this.boundOnscroll = angular.bind(this, this.onscroll);
    window.requestAnimationFrame(this.boundOnscroll);
  },

  sizeAndPosition: function () {
    this.height = window.innerHeight;
    this.halfHeight = this.height / 2;
    angular.element(this.annotationDivs).find('p').css({
      height: this.height + 'px'
    });
  },

  onscroll: function () {
    var currentY = window.scrollY;

    // find current annotation and set current header
    angular.forEach(this.annotationInfo, function (annotation, i) {
      if (annotation !== this.currentAnnotation && currentY > annotation.top && currentY < annotation.bottom) {
        annotation.header.removeClass('up down');
        if (this.currentAnnotation.top < annotation.top) {
          this.currentAnnotation.header.addClass('up');
        } else {
          this.currentAnnotation.header.addClass('down');
        }
        this.currentAnnotation = annotation;
        console.log('current', annotation);
      }
    }, this);

    var distance;
    var opacity;
    angular.forEach(this.currentAnnotation.el.find('p'), function (paragraph) {
      distance = Math.abs(paragraph.offsetTop - currentY);
      opacity = (Math.max(this.halfHeight - distance, 0) / this.halfHeight).toFixed(2);
      angular.element(paragraph).css({opacity: opacity});
      console.log(distance, opacity);
    }, this);

    window.requestAnimationFrame(this.boundOnscroll);
  }
};

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
