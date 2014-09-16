'use strict';

/**
 * Service for video element utilities.
 */
function VideoService(ShotService) {
  var self = this;

  // Shared DOM elements for taking screenshots.
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  // Cache of ImageData already retrieved, keyed on shot integer (hence array)
  // and timecode.
  var screenshotCache = [];

  // Queued requests for screenshots, keyed on shot integer (hence array)
  // and timecode.
  var requests = [];


  /**
   * Whether a screenshot for the given timecode of the current shot has been
   * taken.
   * @param {number} timecode to check.
   * @return {boolean} Whether the screenshot exists.
   */
  this.screenshotTaken = function(timecode) {
    timecode = timecode || 0;
    var shot = ShotService.current;
    var cached = screenshotCache[shot];
    return cached && cached[timecode];
  };


  /**
   * Retrieves the ImageData object for the current frame of the given video.
   * @param {Element} video whose current frame should be screenshot.
   * @return {ImageData} for the current frame of the video.
   * @private
   */
  var getFrameData_ = function(video) {
    var videoHeight = video.videoHeight;
    var videoWidth = video.videoWidth;
    canvas.height = videoHeight;
    canvas.width = videoWidth;
    ctx.drawImage(video, 0, 0);
    return ctx.getImageData(0, 0, videoWidth, videoHeight);
  };


  /**
   * Take a screenshot of the video passed in and store in the cache. The
   * video should already be set to the given timecode.
   *
   * @param {Element} video element to screenshot.
   * @param {number} timecode to key from.
   */
  this.screenshot = function(video, timecode) {
    var shot = ShotService.current;
    var firstScreenshot = !screenshotCache[shot];
    var cached = screenshotCache[shot] || {};
    cached[timecode] = getFrameData_(video);
    screenshotCache[shot] = cached;

    // Handle any outstanding requests for this screenshot.
    var shotRequests = requests[shot];
    var requestsForThisTimecode = shotRequests && shotRequests[timecode];
    if (requestsForThisTimecode && requestsForThisTimecode.length) {
      while(requestsForThisTimecode.length) {
        requestsForThisTimecode.pop()(cached[timecode]);
      }
      requests[shot][timecode] = null;
    }

    // If this is the first screenshot and there are open shot requests, pass
    // this to them (since they would not have been given an initial shot
    // on request).
    if (firstScreenshot && shotRequests) {
      _.forIn(shotRequests, function(requests) {
        _.forEach(requests, function(cb) {
          cb(cached[timecode]);
        });
      });
    }
  };


  /**
   * Request that a screenshot for the given timecode of the current shot video
   * be passed to the given callback function. If the given screenshot is not
   * readily available, attempts to pass a different screenshot from the shot
   * first, and queues the callback to be passed the correct screenshot as
   * soon as it's available.
   *
   * @param {number} timecode of screenshot requested.
   * @param {Function} cb callback function to pass the screenshot data.
   */
  this.requestScreenshot = function(timecode, cb) {
    var shot = ShotService.current;
    var cached = screenshotCache[shot] || {};

    if (cached[timecode]) {
      cb(cached[timecode]);
    } else {
      // Queue callback to be called when we have the screenshot.
      requests[shot] = requests[shot] || {};
      requests[shot][timecode] = requests[shot][timecode] || [];
      requests[shot][timecode].push(cb);

      // Try to callback now with a different screenshot.
      if (cached[0]) {
        // Try for first frame.
        cb(cached[0]);
      } else {
        // Otherwise go with first available.
        _.forIn(cached, function(screenshot) {
          cb(screenshot);
          return false;
        });
      }
    }
  };
}

angular
  .module('shotbyshot')
  .service('VideoService', VideoService);

