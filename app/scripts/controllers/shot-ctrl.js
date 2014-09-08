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
    }];
    var slides = intro.concat(AnnotationParserService.parse(annotations));
    self.slides = slides;
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
      var el = angular.element(annotation);
      var info = {
        index: i,
        top: annotation.offsetTop,
        height: annotation.offsetHeight,
        bottom: annotation.offsetTop + annotation.offsetHeight,
        header: angular.element(this.headers[i]),
        el: el,
        // TODO: is there a better way to find children?
        authorEl: el.find('div').eq(0),
        textEls: el.find('p'),
        paragraphs: []
      };
      this.annotationInfo.push(info);

      angular.forEach(info.textEls, function (textEl) {
        info.paragraphs.push({
          top: textEl.offsetTop
        });
      }, this);
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
    this.doubleHeight = this.height * 2;

    angular.forEach(this.annotationDivs, function (div) {
      angular.element(div).css({paddingTop: this.doubleHeight + 'px'});
    }, this);

    angular.element(this.annotationDivs).find('p').css({
      height: this.height + 'px'
    });
  },

  onscroll: function () {
    var currentY = window.scrollY;
    var slideDistance;

    if (currentY === this.lastY) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

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

    slideDistance = (currentY - this.currentAnnotation.top) / this.height;

    // set opacity of paragraph elements to distance from view
    var distance;
    var opacity;
    angular.forEach(this.currentAnnotation.el.find('p'), function (paragraph, i) {
      distance = Math.abs(this.currentAnnotation.paragraphs[i].top - currentY);
      opacity = (Math.max(this.halfHeight - distance, 0) / this.halfHeight).toFixed(2);
      angular.element(paragraph).css({opacity: opacity});
    }, this);

    // fade in titles
    console.log('slide distance', slideDistance);
    if (slideDistance < 1) {
      this.currentAnnotation.authorEl.css({
        display: 'block',
        opacity: slideDistance
      });
    } else if (slideDistance < 2) {
      this.currentAnnotation.authorEl.css({opacity: 2 - slideDistance});
    } else {
      this.currentAnnotation.authorEl.css({
        display: 'none'
      });
    }

    return window.requestAnimationFrame(this.boundOnscroll);
  }
};

angular
  .module('shotbyshot')
  .controller('ShotCtrl', ShotCtrl);
