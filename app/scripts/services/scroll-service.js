'use strict';

function ScrollService(ShotVideoService) {
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
        top: 0.5,
        ease: 'out'
      },
      {
        key: 0,
        opacity: 1,
        top: 0
      },
      {
        key: 1,
        opacity: 0,
        top: 0
      }
    ],
    'slideInFromBottom': [
      {
        key: 0,
        top: 1,
        ease: 'out'
      },
      {
        key: 0.8,
        top: 0,
      },
      {
        key: 1.2,
        top: 0,
        ease: 'in'
      },
      {
        key: 2,
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


  this.init = function (options) {
    this.$el = options.el;
    this.annotationInfo = [];
    this.height = window.innerHeight;
    this.navHeight = 80;
    this.slides = [];
    this.$slides = [];

    this.headers = document.getElementsByClassName('top-nav-author');
    this.navButtons = document.getElementsByClassName('side-nav-circle');

    this.$background = angular.element(
        document.getElementsByClassName('shot-background')[0]);

    //window.addEventListener('scroll', angular.bind(this, this.onscroll));
    window.addEventListener('resize', angular.bind(this, this.sizeAndPosition));

    this.boundOnscroll = angular.bind(this, this.onscroll);
    this.nextDraw();
  };

  this.keyFrames = {
    'introduction': [
      {
        key: 0,
        backgroundOpacity: 1,
        opacity: 1,
      },
      {
        key: 0.8,
        opacity: 0,
      },
      {
        key: 1,
        backgroundOpacity: 0,
        opacity: 0
      }
    ],
    'outro': [
      {
        key: -0.3,
        backgroundOpacity: 1,
        opacity: 0
      },
      {
        key: 0,
        backgroundOpacity: 0,
        opacity: 0
      },
      {
        key: 0.5,
        opacity: 1
      },
      {
        key: 10,
        opacity: 1
      }
    ],
    'shotvideo': [
      {
        key: 0,
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
        backgroundOpacity: 1
      }
    ],
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
        left: 0,
        top: 0,
        scale: 1,
        ease: 'in-out'
      },
      {
        key: 1.5,
        top: -0.3,
        left: -0.4,
        scale: 0.2
      }
    ],
    'background': [
      {
        key: -0.5,
        top: 1,
        ease: 'out',
        metaOpacity: 1
      },
      {
        key: 0.2,
        top: 0,
        metaOpacity: 1
      },
      {
        key: 0.9,
        metaOpacity: 1
      },
      {
        key: 1,
        top: 0,
        metaOpacity: 0
      }
    ],
    'bg-video': [
      {
        key: -0.5,
        top: 1,
      },
      {
        key: 0,
        top: 0,
      },
      {
        key: 1.5,
        top: 0,
      },
      {
        key: 2,
        top: -1,
      }
    ],
    'main-title': {
      'slide-inner': {
        frames: [
          {
            key: -0.9,
            top: 1,
            ease: 'out'
          },
          {
            key: -0.6,
            top: 0,
          },
          {
            key: 0.5,
            top: 0,
          },
          {
            key: 1,
            top: -1,
          },
        ],
      },
      'slide-main-title-description': {
        frames: [
          {
            key: -0.6,
            top: 1,
          },
          {
            key: -0.3,
            top: 0,
          },
        ]
      },
      'slide-main-title-subtitle': {
        frames: [
          {
            key: -0.3,
            top: 1,
          },
          {
            key: 0,
            top: 0,
          },
        ]
      },
      'slide-main-title-play': {
        frames: [
          {
            key: -0.3,
            top: 1,
          },
          {
            key: 0,
            top: 0,
          },
        ]
      },
    },
    'text': KeyFrameSets.fadeInFromBottom,
    'highlight': KeyFrameSets.highlightStart,
    'photo': KeyFrameSets.slideInFromBottom,
    'streetview': KeyFrameSets.slideInFromBottom,
    'video': [
      {
        key: 0,
        top: 1,
        ease: 'out'
      },
      {
        key: 0.5,
        top: 0
      },
      {
        key: 1,
        top: 0
      },
      {
        key: 1.5,
        top: -1
      }
    ]
  };


  this.easing = {
    'linear': function (percent) {
      return percent;
    },

    'in': function (percent) {
      return percent * percent;
    },

    'out': function (percent) {
      return percent * (percent - 2) * -1;
    },

    'in-out': function (percent) {
      percent = percent * 2;
      if (percent < 1) {
        return percent * percent * 0.5;
      }
      return -0.5 * ((--percent) * (percent - 2) - 1);
    },

    'cube-in': function (percent) {
      return percent * percent * percent;
    },

    'cube-out': function (percent) {
      return (percent -= 1) * percent * percent + 1;
    }
  };


  this.setSlides = function (slides) {
    this.slides = slides;

    var self = this;
    window.setTimeout(function () {
      self.$slides = self.$el[0].getElementsByClassName('slide');
      self.sizeAndPosition();
    }, 100);
  };


  this.scrollToSlide = function (slide) {
    window.scrollTo(0, slide.padded_top);
  };


  this.sizeAndPosition = function () {
    this.height = window.innerHeight;
    this.halfHeight = this.height / 2;
    this.doubleHeight = this.height * 2;

    var author;
    var bg;
    var headerIndex = 0;

    var shotVideoWidth = 1075; // TODO(dbow): Should not be hard coded.
    var windowWidth = window.innerWidth;
    var videoPercentOfScreen = shotVideoWidth / windowWidth;
    var videoOffsetPercent = ((windowWidth - shotVideoWidth) / 2) / windowWidth;

    console.log('sizing');
    console.log('slides', this.slides.length);
    console.log('$slides', this.$slides.length);
    if (this.slides.length < 1 || this.$slides.length < 1) {
      return;
    }

    console.log('$slides', this.$slides);
    console.log('slides', this.slides);
    angular.forEach(this.slides, function (slide, i) {
      console.log(this.$slides[i]);
      var el = this.$slides[i];
      slide.top = el.offsetTop;
      slide.height = el.offsetHeight;
      slide.bottom = slide.top + slide.height;
      slide.padded_top = Math.round(slide.top + (slide.height - this.height) / 2);
      slide.el = el;
      slide.$el = angular.element(el);
      slide.$inner = slide.$el.find('div').eq(0);
      slide.$meta = angular.element(
          slide.el.getElementsByClassName('meta-text')[0]);
      slide.index = i;

      slide.keyFrames = _.clone(this.keyFrames[slide.type], true) || [];

      // uses key-val keyFrames
      if (!_.isArray(slide.keyFrames)) {
        _.each(slide.keyFrames, function (path, klass) {
          path.$el = angular.element(slide.$el[0].getElementsByClassName(klass));
        });
      }

      if (slide.type === 'highlight') {
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
            key: 0.2,
            top: top,
            left: left,
            metaOpacity: 1
          },
          {
            key: 0.7,
            top: top,
            left: left,
            metaOpacity: 1,
            opacity: 1
          },
          {
            key: 1,
            top: top,
            left: left,
            metaOpacity: 0,
            opacity: 0
          }
        ]);

        // TODO(dbow): Probably need to dynamically position the meta text
        //     based on the % (i.e. detect if it's likely to run off the page).
      }

      if (slide.nav || slide.type === 'author') {
        slide.headerEl = this.headers[headerIndex];
        slide.navButton = this.navButtons[headerIndex];
        headerIndex++;
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
            top: 0,
            metaOpacity: 0
          },
          {
            key: i - bg.index,
            opacity: 0,
            top: -1,
            metaOpacity: 0
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
    this.reflow();
  };


  this.currentSlide = {};

  this.currentAnnotation = {};

  this.nextDraw = function () {
    this.animationFrame = window.requestAnimationFrame(this.boundOnscroll);
  };

  this.reflow = function () {
    window.cancelAnimationFrame(this.animationFrame);
    this.onscroll();
  };

  this.onscroll = function () {
    var currentY = window.scrollY;
    var slideDistance;
    var currentSlideIndex;

    if (!this.slides || !this.slides.length || currentY === this.lastY || currentY < 0) {
      return this.nextDraw();
    }

    this.lastY = currentY;

    var slideHeight = this.height;

    angular.forEach(this.slides, function (slide, i) {
      var slideFrame = (currentY - slide.top) / slideHeight;
      var keyFrames = slide.keyFrames;
      if (!keyFrames) {
        return;
      }
      var mainKeyFrames = _.isArray(keyFrames) ? keyFrames : keyFrames['slide-inner'].frames;
      var numFrames = mainKeyFrames.length;
      var frameIndex = _.sortedIndex(mainKeyFrames, {
        key: slideFrame
      }, 'key');
      var beforeFirstFrame = frameIndex === 0 && slideFrame < mainKeyFrames[0].key;
      if (beforeFirstFrame) {
        if (!slide.hidden) {
          slide.$inner.css({'display': 'none'});
          slide.hidden = true;
        }
        return;
      }
      var afterLastFrame = frameIndex === numFrames &&
                           slideFrame > mainKeyFrames[numFrames - 1].key;
      if (afterLastFrame) {
        if (!slide.hidden) {
          slide.$inner.css({'display': 'none'});
          slide.hidden = true;
        }
        return;
      }

      slide.hidden = false;

      // Find the target header for the current slide.
      if (slideFrame >= 0 && slideFrame <= 1) {
        if (this.currentSlide !== slide) {
          if (this.currentSlide.onExit) {
            this.currentSlide.onExit();
          }
          if (slide.onEnter) {
            slide.onEnter();
          }
          this.currentSlide = slide;

          // If new annotation is in view, update shot video loop bounds.
          if (slide.annotation && this.currentAnnotation !== slide.annotation) {
            this.currentAnnotation = slide.annotation;
            ShotVideoService.setLoopBounds(this.currentAnnotation.timecodes);
          }
        }
        var targetHeader = slide.headerEl;
        var targetNav = slide.navButton;
        if (!targetHeader) {
          var prevSlides = this.slides.slice(0, i);
          _.forEachRight(prevSlides, function(prevSlide) {
            if (prevSlide.headerEl) {
              targetHeader = prevSlide.headerEl;
            }
            if (prevSlide.navButton) {
              targetNav = prevSlide.navButton;
              return false;
            }
          });
        }

        // Adjust header classes so target header is displayed.
        if (targetHeader && (!this.lastHeader || this.lastHeader !== targetHeader)) {
          var newHeader;
          angular.forEach(this.headers, function (header) {
            var el = angular.element(header);
            if (header === targetHeader) {
              newHeader = el;
              el.removeClass('up').removeClass('down');
            } else if (!newHeader) {
              el.addClass('up').removeClass('down');
            } else {
              el.addClass('down').removeClass('up');
            }
          }, this);

          if (this.lastNav) {
            angular.element(this.lastNav).removeClass('highlighted');
          }
          angular.element(targetNav).addClass('highlighted');

          this.lastNav = targetNav;
          this.lastHeader = targetHeader;
        }
      }

      var css = {};
      var previousFrame;
      var ease;
      var paths;

      if (_.isArray(keyFrames)) {
        paths = [{$el: slide.$inner, frames: keyFrames}];
      } else {
        paths = _.toArray(keyFrames);
      }

      _.each(paths, function (path) {
        keyFrames = path.frames;

        _.forEach(keyFrames, function(frame) {
          if (slideFrame === frame.key) {
            css = _.omit(frame, ['key', 'event']);
            // TODO(dbow): Process events.
            return false;
          } else {
            if (slideFrame > frame.key) {
              css = _.omit(frame, ['key', 'event']);
              previousFrame = frame.key;
              ease = frame.ease || 'linear';
            } else {
              var percentageThroughFrame = (slideFrame - previousFrame) /
                                           (frame.key - previousFrame);
              var easedPercent = this.easing[ease](percentageThroughFrame);
              var combinedCss = {};
              _.forEach(frame, function(val, key) {
                if (key === 'key' || key === 'event') {
                  return;
                }
                if (css[key] !== undefined) {
                  combinedCss[key] = css[key] +
                      (val - css[key]) * easedPercent;
                }
              });
              css = combinedCss;
              return false;
            }
          }
        }, this);

        var transformX = 0;
        var transformY = 0;
        var scale = '';
        _.forEach(css, function(val, prop) {
          if (prop === 'top') {
            transformY = (val * this.height).toFixed(1) + 'px';
          } else if (prop === 'left') {
            transformX = (val * 100).toFixed(1) + '%';
          } else if (prop === 'scale') {
            scale = ' scale(' + val.toFixed(2) + ')';
          } else if (prop === 'opacity' || prop === 'backgroundOpacity') {
            css[prop] = val.toFixed(2);
          }
        }, this);
        path.$el.css({
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
    }, this);

    return this.nextDraw();
  }
}


angular
  .module('shotbyshot')
  .service('ScrollService', ScrollService);

