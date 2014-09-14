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
  'highlightStart': [
    {
      key: -0.5,
      top: 0,
      left: 1,
      metaOpacity: 0
    }
  ],
  'videoEvents': [
    {
      key: 0,
      event: 'videoSlideVisibilityChange',
      backgroundOpacity: 1
    },
    {
      key: 0.2,
      backgroundOpacity: 0
    },
    {
      key: 0.8,
      backgroundOpacity: 0
    },
    {
      key: 1,
      event: 'videoSlideVisibilityChange',
      backgroundOpacity: 1
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
    'highlight': KeyFrameSets.highlightStart,
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

    var author;
    var bg;
    var highlight;
    var headerIndex = 0;

    var shotVideoWidth = 1075; // TODO(dbow): Should not be hard coded.
    var windowWidth = window.innerWidth;
    var videoPercentOfScreen = shotVideoWidth / windowWidth;
    var videoOffsetPercent = ((windowWidth - shotVideoWidth) / 2) / windowWidth;

    angular.forEach(this.slides, function (slide, i) {
      var el = this.$slides[i];
      slide.top = el.offsetTop;
      slide.bottom = slide.top + this.height;
      slide.el = el;
      slide.$el = angular.element(el);
      slide.$inner = slide.$el.find('div').eq(0);
      slide.$meta = angular.element(
          slide.el.getElementsByClassName('meta-text')[0]);
      slide.index = i;

      slide.keyFrames = _.clone(this.keyFrames[slide.type], true) || [];

      if (highlight && slide.annotation !== author.annotation) {
        var lastKeyframe = _.last(highlight.keyFrames);
        highlight.keyFrames = highlight.keyFrames.concat([
          {
            key: i - highlight.index - 1.5,
            opacity: 1,
            top: lastKeyframe.top,
            left: lastKeyframe.left,
            metaOpacity: 1
          },
          {
            key: i - highlight.index - 1,
            opacity: 0,
            top: lastKeyframe.top,
            left: lastKeyframe.left,
            metaOpacity: 1
          }
        ]);
      }

      if (slide.type === 'highlight') {
        highlight = slide;

        var top = slide.annotation.highlight.y / 100;
        var left = slide.annotation.highlight.x / 100;
        top = videoOffsetPercent + top * videoPercentOfScreen;
        left = videoOffsetPercent + left * videoPercentOfScreen;
        slide.keyFrames = slide.keyFrames.concat([
          {
            key: 0,
            top: top,
            left: left,
            metaOpacity: 0
          },
          {
            key: 0.5,
            top: top,
            left: left,
            metaOpacity: 1
          }
        ]);

        // TODO(dbow): Probably need to dynamically position the meta text
        //     based on the % (i.e. detect if it's likely to run off the page).
      }

      if (slide.nav || slide.type === 'author') {
        slide.headerEl = this.headers[headerIndex++];
      }

      // Dynamically add last two keyframes for author based on when the next
      // annotation comes in.
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

      // Keep reference to author until next annotation.
      if (slide.type === 'author') {
        author = slide;
      }

      // Dynamically add last two keyframes for background based on when the
      // next annotation comes in.
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

      // Keep reference to background until next annotation.
      if (slide.type === 'background') {
        bg = slide;
      }
    }, this);

    // Force an update to the layout.
    this.lastY = undefined;
    this.onscroll();
  },

  onscroll: function () {
    var currentY = window.scrollY;
    var slideDistance;
    var currentSlideIndex;

    if (!this.slides || !this.slides.length || currentY === this.lastY || currentY < 0) {
      return window.requestAnimationFrame(this.boundOnscroll);
    }

    this.lastY = currentY;

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

      if (slide.headerEl !== undefined &&
          slideFrame >= 0 && slideFrame <= 1) {
        var newHeader;
        angular.forEach(this.headers, function (header) {
          var el = angular.element(header);
          if (header === slide.headerEl) {
            newHeader = el;
            el.removeClass('up').removeClass('down');
          } else if (!newHeader) {
            el.addClass('up').removeClass('down');
          } else {
            el.addClass('down').removeClass('up');
          }
        }, this);
      }

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
        'opacity': (css['opacity'] !== undefined ? css['opacity'] : 1)
      });

      if (css['metaOpacity'] !== undefined) {
        slide.$meta.css({
          'opacity': css['metaOpacity']
        });
      }

      if (css['backgroundOpacity'] !== undefined) {
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

