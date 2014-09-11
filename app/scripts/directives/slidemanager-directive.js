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

      } else if (slide.type === 'author') {
      }
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
      slide.inView = currentY > slide.top || currentY < slide.bottom;
    }, this);

    if (!this.currentSlide) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    var nextSlide = this.slides[index + 1];
    var previousSlide = this.slides[index - 1];
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

      // pin background slides
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

