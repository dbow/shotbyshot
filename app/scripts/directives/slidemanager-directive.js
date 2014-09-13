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


/**
 * key: distance from current slide of the keyframe, in units of slides.
 *     so -1 means this keyframe starts when the current slide is one full
 *     slide away from this slide. 0 means this slide is fully in view.
 *     1 means this slide is fully out of view.
 */
var KeyFrameSets = {
  'fadeInFromBottom': [
    {
      key: -1,
      opacity: 0,
      top: 1
    },
    {
      key: -0.5,
      opacity: 0,
      top: 0.5
    },
    {
      key: 0,
      opacity: 1,
      top: 0
    },
    {
      key: 0.5,
      opacity: 0,
      top: -0.5
    },
    {
      key: 1,
      opacity: 0,
      top: -1
    }
  ],
  'slideInFromBottom': [
    {
      key: -1,
      top: 1
    },
    {
      key: 0,
      top: 0
    },
    {
      key: 1,
      top: -1
    }
  ],
  'videoEvents': [
    {
      key: 0,
      event: 'videoSlideVisibilityChange'
    },
    {
      key: 1,
      event: 'videoSlideVisibilityChange'
    }
  ],
  /**
   * Performs a merge of two arrays of objects by merging b into a.
   * For every object in b, if an object in a with the same key value is found
   * then b's object is _.merged into it. If an object in a is not found, the
   * object from b is spliced in. Clones array a so neither array is changed.
   * Returns the resulting array.
   */
  construct: function(a, b) {
    a = _.clone(a, true);
    _.forEach(b, function(keyFrame) {
      var aKeyFrame = _.find(a, {
        key: keyFrame.key
      });
      if (aKeyFrame) {
        aKeyFrame = _.merge(aKeyFrame, keyFrame);
      } else {
        var sortedIndex = _.sortedIndex(a, keyFrame, 'key');
        a.splice(sortedIndex, 0, keyFrame);
      }
    });
    return a;
  }
};

var Scroller = {

  init: function (options) {
    this.$el = options.el;
    this.annotationInfo = [];
    this.height = window.innerHeight;
    this.navHeight = 80;
    this.slides = [];
    this.$slides = [];

    this.headers = document.getElementsByClassName('top-nav-author');

    this.$background = angular.element(
        document.getElementsByClassName('shot-background')[0]);

    //window.addEventListener('scroll', angular.bind(this, this.onscroll));
    window.addEventListener('resize', angular.bind(this, this.sizeAndPosition));

    this.boundOnscroll = angular.bind(this, this.onscroll);
    window.requestAnimationFrame(this.boundOnscroll);
  },

  keyFrames: {
    'introduction': [
      {
        key: 0,
        backgroundOpacity: 1
      },
      {
        key: 0.8,
        opacity: 1
      },
      {
        key: 1,
        backgroundOpacity: 0,
        opacity: 0
      }
    ],
    'shotvideo': KeyFrameSets.videoEvents,
    'author': [
      {
        key: 0,
        opacity: 0,
      },
      {
        key: 0.5,
        opacity: 1,
        left: 0,
        top: 0,
        scale: 1
      },
      {
        key: 1,
        top: -0.3,
        left: -0.4,
        scale: 0.2
      }
    ],
    'background': [
      {
        key: -0.5,
        top: 1
      },
      {
        key: 0.2,
        top: 0
      },
      {
        key: 1,
        top: 0
      }
    ],
    'text': KeyFrameSets.fadeInFromBottom,
    'highlight': KeyFrameSets.fadeInFromBottom, // TODO construct highlight dynamically.
    'photo': KeyFrameSets.slideInFromBottom,
    'streetview': KeyFrameSets.slideInFromBottom,
    'video': KeyFrameSets.construct(
        KeyFrameSets.videoEvents,
        [
          {
            key: -0.5,
            top: 1,
          },
          {
            key: 0,
            top: 0
          },
          {
            key: 0.5,
            top: 0,
            event: 'videoSlideVisibilityChange'
          },
          {
            key: 1,
            top: -1,
            event: null
          }
        ])
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
    this.tripleHeight = this.height * 3;

    var annotation;
    var annotationIndex = 0;

    var author;
    var bg;

    angular.forEach(this.slides, function (slide, i) {
      var el = this.$slides[i];
      slide.top = el.offsetTop;

      slide.bottom = slide.top + this.height;
      slide.el = el;
      slide.$el = angular.element(el);
      slide.$inner = slide.$el.find('div').eq(0);
      slide.index = i;

      slide.keyFrames = _.clone(this.keyFrames[slide.type], true) || [];

      if (annotation !== slide.annotation) {
        annotation = slide.annotation;
        annotation.index = annotationIndex++;
        annotation.header = angular.element(this.headers[annotation.index]);
      }

      if (author && slide.annotation !== author.annotation) {
        author.keyFrames = author.keyFrames.concat([
          {
            key: i - author.index - 1.5,
            opacity: 1,
            top: -0.3,
            left: -0.4,
            scale: 0.2
          },
          {
            key: i - author.index - 1,
            opacity: 0,
            top: -0.3,
            left: -0.4,
            scale: 0.2
          }
        ]);
        author = null;
      }

      if (slide.type === 'author') {
        author = slide;
      }

      if (bg && slide.annotation !== bg.annotation) {
        bg.keyFrames = bg.keyFrames.concat([
          {
            key: i - bg.index - 0.5,
            opacity: 1,
            top: 0
          },
          {
            key: i - bg.index,
            opacity: 0,
            top: -1
          }
        ]);
        bg = null;
      }

      if (slide.type === 'background') {
        bg = slide;
      }
    }, this);

  },

  onscroll: function () {
    var currentY = window.scrollY;
    var slideDistance;
    var currentSlideIndex;

    if (!this.slides || !this.slides.length || currentY === this.lastY || currentY < 0) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    this.lastY = currentY;

    // TODO(dbow): Restore header stuff.

    // show a header
    // angular.forEach(this.headers, function (header, i) {
      // var el = angular.element(header);
      // if (i < annotationIndex) {
        // el.addClass('up').removeClass('down');
      // } else if (i > annotationIndex) {
        // el.addClass('down').removeClass('up');
      // }
    // }, this);

    var slideHeight = this.height;

    angular.forEach(this.slides, function (slide, i) {
      var slideFrame = (currentY - slide.top) / slideHeight;
      var keyFrames = slide.keyFrames;
      if (!keyFrames) {
        return;
      }
      var numFrames = keyFrames.length;
      var frameIndex = _.sortedIndex(keyFrames, {
        key: slideFrame
      }, 'key');
      var beforeFirstFrame = frameIndex === 0 && slideFrame < keyFrames[0].key;
      if (beforeFirstFrame) {
        if (!slide.hidden) {
          slide.$inner.css({'display': 'none'});
          slide.hidden = true;
        }
        return;
      }
      var afterLastFrame = frameIndex === numFrames &&
                           slideFrame > keyFrames[numFrames - 1].length;
      if (afterLastFrame) {
        if (!slide.hidden) {
          slide.$inner.css({'display': 'none'});
          slide.hidden = true;
        }
        return;
      }

      slide.hidden = false;

      var css = {};
      var previousFrame;
      _.forEach(keyFrames, function(frame) {
        if (slideFrame === frame.key) {
          css = _.omit(frame, ['key', 'event']);
          // TODO(dbow): Process events.
          return false;
        } else {
          if (slideFrame > frame.key) {
            css = _.omit(frame, ['key', 'event']);
            previousFrame = frame.key;
          } else {
            var percentageThroughFrame = (slideFrame - previousFrame) /
                                         (frame.key - previousFrame);
            var combinedCss = {};
            _.forEach(frame, function(val, key) {
              if (key === 'key' || key === 'event') {
                return;
              }
              if (css[key] !== undefined) {
                combinedCss[key] = css[key] +
                    (val - css[key]) * percentageThroughFrame;
              }
            });
            css = combinedCss;
            return false;
          }
        }
      });

      var transformX = 0;
      var transformY = 0;
      var scale = '';
      _.forEach(css, function(val, prop) {
        if (prop === 'top') {
          transformY = (val * 100).toFixed(1) + '%';
        } else if (prop === 'left') {
          transformX = (val * 100).toFixed(1) + '%';
        } else if (prop === 'scale') {
          scale = ' scale(' + val.toFixed(2) + ')';
        } else if (prop === 'opacity' || prop === 'backgroundOpacity') {
          css[prop] = val.toFixed(2);
        }
      });
      slide.$inner.css({
        'transform': 'translate3d(' + transformX + ', ' + transformY + ', 0)' + scale,
        'display': 'block',
        'opacity': css['opacity'] || 1
      });

      if (css['backgroundOpacity']) {
        this.$background.css({
          'opacity': css['backgroundOpacity']
        });
      }
    }, this);

    return window.requestAnimationFrame(this.boundOnscroll);
  }
};

angular
  .module('shotbyshot')
  .directive('slideManager', SlideManager);

