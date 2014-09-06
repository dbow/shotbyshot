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

    window.addEventListener('scroll', angular.bind(this, this.onscroll));

    this.headers = document.getElementsByClassName('top-nav-author');
    this.annotationDivs = document.getElementsByClassName('annotation');

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

    //document.body.style.height = (this.height * annotations.length) + 'px';
    console.log('hi', this.annotationInfo);
  },

  onscroll: function () {
    var currentY = Math.floor(window.scrollY / this.height);
    currentY = window.scrollY;

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

      return;
      if (annotation.y <= currentY) {
        annotation.el.classList.add('pin');
        annotation.el.style.top = 0;
      } else {
        annotation.el.classList.remove('pin');
        annotation.el.style.top = (i * Scroller.height) + 'px';
      }
    }, this);
  }
};

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
