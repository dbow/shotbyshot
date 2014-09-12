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

    var bg;
    var annotation;
    var annotationIndex = 0;

    angular.forEach(this.slides, function (slide, i) {
      var el = this.$slides[i];
      slide.top = el.offsetTop;
      slide.bottom = slide.top + this.height;
      slide.el = el;
      slide.$el = angular.element(el);
      slide.$inner = slide.$el.find('div').eq(0);
      slide.index = i;

      if (annotation !== slide.annotation) {
        annotation = slide.annotation;
        annotation.index = annotationIndex++;
        annotation.header = angular.element(this.headers[annotation.index]);
      }

      if (bg && slide.annotation === bg.annotation) {
        slide.bg = bg;
      }

      if (slide.type === 'background') {
        bg = slide;
      }
    }, this);

    console.log('slides', this.slides);
  },

  onscroll: function () {
    var currentY = window.scrollY;
    var slideDistance;
    var currentSlideIndex;

    if (!this.slides || !this.slides.length || currentY === this.lastY) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    angular.forEach(this.slides, function (slide, i) {
      if (currentY > slide.top && currentY < slide.bottom) {
        currentSlideIndex = i;
        this.currentSlide = slide;
      }
      slide.inView = currentY > slide.top || currentY < slide.bottom;
    }, this);

    if (!this.currentSlide) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    var nextSlide = this.slides[currentSlideIndex + 1];
    var previousSlide = this.slides[currentSlideIndex - 1];
    var props;

    var annotationIndex;

    if (this.currentSlide.annotation) {
      annotationIndex = this.currentSlide.annotation.index;
      this.currentSlide.annotation.header.removeClass('up down');
    } else {
      annotationIndex = -1;
    }

    // show a header
    angular.forEach(this.headers, function (header, i) {
      var el = angular.element(header);
      if (i < annotationIndex) {
        el.addClass('up').removeClass('down');
      } else if (i > annotationIndex) {
        el.addClass('down').removeClass('up');
      }
    }, this);

    angular.forEach(this.slides, function (slide) {
      slideDistance = currentY - slide.top;

      // pin background slides until change in background.
      if (slide.type === 'background') {
        if (currentY < slide.top) {
          slide.$inner.css({position: 'relative', top: 0});
        } else if (slide === this.currentSlide || slide === this.currentSlide.bg) {
          if (nextSlide && nextSlide.bg !== slide) {
            slide.$inner.css({position: 'fixed', top: (this.currentSlide.top - currentY) + 'px'});
          } else {
            slide.$inner.css({position: 'fixed', top: 0});
          }
        } else {
          slide.$inner.css({position: 'fixed', top: -this.height + 'px'});
        }
      }

      if (slide.type === 'author') {
        if (slide === this.currentSlide && slideDistance < this.height) {
            slide.$inner.removeClass('pin');
            slide.$el.css({opacity: (slideDistance / this.height).toFixed(2)});
            slide.$inner.addClass('show');
        } else if (slide.annotation === this.currentSlide.annotation) {
            slide.$el.css({opacity: 1});
            slide.$inner.addClass('show');
            if (slideDistance > this.doubleHeight) {
              slide.$inner.addClass('pin');
            }
        } else {
          slide.$inner.removeClass('pin show');
        }
      }

      // loop over visible slides
      if (slide.inView) {
        // text opacity
        if (slide.type === 'text' || slide.type === 'photo') {
          var opacity = (1 - Math.min(Math.abs(slideDistance) / this.halfHeight, 1)).toFixed(2);
          slide.$el.css({opacity: opacity});
        }
      }
    }, this);

    return window.requestAnimationFrame(this.boundOnscroll);
  }
};

angular
  .module('shotbyshot')
  .directive('slideManager', SlideManager);

