'use strict';

/**
 *
 */
function SlideManager() {
  return {
    restrict: 'E',
    template: [
          '<slide ng-repeat="slide in slides" data="slide">' +
          '</slide>'
        ].join(''),
    scope: {
      slides: '=?',
    },
    link: function ($scope, $element) {
      // Reference to the container element - can query for slide children.
      console.log('slide manager el', $element);

      Scroller.init({el: $element});

      $scope.$watch('slides', function(newValue, oldValue) {
        // Array of slide DIVs.
        console.log('slides', $scope.slides, newValue);

        Scroller.setSlides($scope.slides);
      });
    }
  };
}

var Scroller = {
  init: function (options) {
    this.$el = options.el;
    this.annotationInfo = [];
    this.height = window.innerHeight;
    this.navHeight = 80;
    this.slides = [];
    this.$slides = [];

    this.headers = document.getElementsByClassName('top-nav-author');

    //window.addEventListener('scroll', angular.bind(this, this.onscroll));
    window.addEventListener('resize', angular.bind(this, this.sizeAndPosition));

    this.boundOnscroll = angular.bind(this, this.onscroll);
    window.requestAnimationFrame(this.boundOnscroll);
  },

  s: function () {

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
  },

  setSlides: function (slides) {
    this.slides = slides;
    this.$slides = this.$el[0].getElementsByClassName('slide');

    var self = this;
    window.setTimeout(function () {
      self.sizeAndPosition();
    }, 0);
  },

  sizeAndPosition: function () {
    this.height = window.innerHeight;
    this.halfHeight = this.height / 2;
    this.doubleHeight = this.height * 2;

    angular.forEach(this.slides, function (slide, i) {
      var el = this.$slides[i];
      slide.top = el.offsetTop;
      slide.bottom = slide.top + this.height;
      slide.el = el;
      slide.$el = angular.element(el);
      slide.index = i;
    }, this);

    console.log('slides', this.slides);

    return;
    this.$slides.css({
      height: this.height
    });

    return;

    angular.forEach(this.slides, function (div) {
      angular.element(div).css({paddingTop: this.doubleHeight + 'px'});
    }, this);

    angular.element(this.annotationDivs).find('p').css({
      height: this.height + 'px'
    });
  },

  onscroll: function () {
    var currentY = window.scrollY;
    var slideDistance;
    var slide;
    var index;
    var i;

    if (!this.slides || !this.slides.length || currentY === this.lastY) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    angular.forEach(this.slides, function (slide, i) {
      if (currentY > slide.top && currentY < slide.bottom) {
        index = i;
        this.currentSlide = slide;
      }
    }, this);

    if (!this.currentSlide) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    // text opacity
    for (i = Math.max(index - 1, 0); i < index + 2 && i < this.slides.length; i++) {
      slide = this.slides[i];
      slideDistance = currentY - slide.top;

      if (slide.type === 'text' || slide.type === 'photo') {
        var opacity = (1 - Math.min(Math.abs(slideDistance) / this.halfHeight, 1)).toFixed(2);
        slide.$el.css({opacity: opacity});
      }
    }

    return window.requestAnimationFrame(this.boundOnscroll);

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
  .directive('slideManager', SlideManager);

