'use strict';

/**
 * Service for video element utilities.
 */
function VideoService() {
  var self = this;

  // Shared DOM elements.
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var video = document.createElement('video');

  // Cache of ImageData already retrieved.
  var screenshotCache = {};

  // Map of requests for ImageData for the same video URL. Only one will
  // trigger the video request - the rest will be passed the result of the
  // first.
  var batch = {};

  // Queue of requests for screenshots.
  var screenshotQueue = [];


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
   * Take a screenshot of the video passed in.
   *
   * @param {Element|string} videoToScreenshot either an actual video element
   *     in which case the current frame will be screenshot, or a video URL
   *     which should have a #t= fragment if a frame other than the first is
   *     desired.
   * @param {Function=} opt_cb optional callback function. Required if a string
   *     is passed in as the video, since the video will have to be loaded
   *     before a screenshot can be taken.
   * @return {ImageData|undefined} If a loaded video is passed in, returns the
   *     ImageData for the frame. Otherwise, the callback will be used to do
   *     further work.
   */
  this.screenshot = function(videoToScreenshot, opt_cb) {
    var screenshot;
    var getVideoData;

    // If a URL is passed in, load the video in the local video element and
    // then grab frame data and pass to callback.
    if (typeof videoToScreenshot === 'string') {

      // Check the cache for this url.
      if (screenshotCache[videoToScreenshot]) {
        opt_cb(screenshotCache[videoToScreenshot]);
        return;
      }

      // Batch requests to the same URL.
      if (!batch[videoToScreenshot]) {
        batch[videoToScreenshot] = [];
      } else {
        batch[videoToScreenshot].push(opt_cb);
        return;
      }

      // If video element is currently loading another video, add this request
      // to the queue - it will be processed when the video element is free.
      if (video.src) {
        screenshotQueue.push([videoToScreenshot, opt_cb]);
        return;
      }

      getVideoData = function() {
        var imageData = getFrameData_(video);
        if (imageData) {
          // Pass result to callback.
          opt_cb(imageData);

          // Cache result.
          screenshotCache[videoToScreenshot] = imageData;

          // See if there were any other requests batched that need the result.
          if (batch[videoToScreenshot] && batch[videoToScreenshot].length) {
            while(batch[videoToScreenshot].length) {
              batch[videoToScreenshot].pop()(imageData);
            }
          }

          // See if any other requests need to use the video element now.
          if (screenshotQueue.length) {
            var next = screenshotQueue.pop();
            self.screenshot(next[0], next[1]);
          }
        }

        // Clean up video.
        video.src = '';
        video.removeEventListener('loadeddata', getVideoData);
      };

      // Wait til we get the first frame of data.
      video.addEventListener('loadeddata', getVideoData);
      video.src = videoToScreenshot;

    // Otherwise, video is loaded and we can just get the data.
    } else {
      return getFrameData_(videoToScreenshot);
    }
  };
}

angular
  .module('shotbyshot')
  .service('VideoService', VideoService);

