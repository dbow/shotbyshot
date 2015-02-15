'use strict';


/**
 * Service that handles auto-scrolling the page.
 */
function AutoScrollerService() {
  /**
   * The target scroll value.
   * @type {number|null}
   */
  var scrollTarget = null;

  /**
   * The amount to scroll by each time.
   * @const
   */
  var SCROLL_AMOUNT = 5;

  /**
   * Scrolls down by SCROLL_AMOUNT until user interacts with the page or it
   * reaches the bottom.
   *
   * Will detect user interaction if the current scroll is different than the
   * previous target. Uses requestAnimationFrame to do the scrolling in a
   * render/performance-friendly way.
   */
  function scrollDown() {
    var currentScroll = window.pageYOffset;

    if (scrollTarget !== null) {
      // Stop if user action changed the page's scroll value from what we
      // expect.
      //
      // Check against the last scroll target too because Safari sometimes
      // doesn't synchronously update the scroll with window.scrollTo before
      // the requestAnimationFrame method is invoked.
      if (currentScroll !== scrollTarget &&
          currentScroll !== scrollTarget - SCROLL_AMOUNT) {
        scrollTarget = null;
        return;
      }
    }

    // Stop if we reach the bottom.
    var scrollHeight = Math.max(document.body.scrollHeight, // Chrome, Safari
                                document.documentElement.scrollHeight); // FF
    if (currentScroll + window.innerHeight >= scrollHeight) {
      scrollTarget = null;
      return;
    }

    // Update target, scroll to it, and call this function again.
    scrollTarget = currentScroll + SCROLL_AMOUNT;
    window.scrollTo(0, scrollTarget);
    window.requestAnimationFrame(scrollDown);
  }


  /**
   * Start auto-scrolling.
   */
  this.autoScroll = function() {
    // Start halfway through the video slide.
    window.scrollTo(0, window.innerHeight / 2);

    scrollDown();
  };
}

angular
  .module('shotbyshot')
  .service('AutoScrollerService', AutoScrollerService);


