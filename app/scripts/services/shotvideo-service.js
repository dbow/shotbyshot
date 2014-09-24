'use strict';


/**
 * Service for manipulating the video element for the shot.
 */
function ShotVideoService() {
  var self = this;


  /**
   * Default bounds object i.e. no bounds.
   * @type {Object}
   */
  var defaultBounds = {
    start: 0,
    end: 0
  };


  /**
   * Reference to currently operating bounds object.
   * @type {Object}
   */
  var bounds = defaultBounds;


  /**
   * Whether video is currently being played (as opposed to silently looped).
   * @type {boolean}
   */
  var playing = false;


  /**
   * Callback function to execute when playback finishes.
   * @type {Function}
   */
  var cb = null;


  /**
   * Store reference to given video and add listener for timeupdate.
   * @param {Element} video element to register.
   */
  this.registerShotVideo = function(video) {
    // Remove pre-existing event listener if present.
    if (self.video) {
      self.video.removeEventListener('timeupdate', self.onTimeUpdate, false);
    }

    // Update video reference.
    self.video = video;

    // Re-set bounds.
    bounds = defaultBounds;

    // Listen for timeupdates.
    self.video.addEventListener('timeupdate', self.onTimeUpdate, false);
  };


  /**
   * If video is ready, restores normal playrate, unmutes video, and sets
   * time to beginning. Basically, plays the video.
   * @param {Function} onComplete callback when this play ends.
   */
  this.play = function(onComplete) {
    if (self.video.readyState !== 4) {
      return;
    }
    playing = true;
    cb = onComplete;
    self.video.currentTime = 0;
    self.video.playbackRate = 1;
    self.video.muted = false;
    self.video.loop = false;
    if (onComplete) {
      self.video.addEventListener('ended', cb, false);
    }
  };


  /**
   * Restores slow motion, muted playback of shot video.
   */
  this.resumeLoop = function() {
    playing = false;
    self.video.playbackRate = 0.3;
    self.video.muted = true;
    self.video.loop = true;
    self.video.removeEventListener('ended', cb, false);
    cb = null;
    self.video.currentTime = 0;
    self.video.play();
  };


  /**
   * Pauses the video.
   */
  this.pause = function() {
    self.video.playbackRate = 0;
  };


  /**
   * Update the loop bounds with the given object.
   * @param {Object} timecodes to use.
   */
  this.setLoopBounds = function(timecodes) {
    bounds = timecodes || defaultBounds;
  };


  /**
   * On timeupdate of the video, check if the currentTime is outside of the
   * current bounds and adjust accordingly if so.
   */
  this.onTimeUpdate = function() {
    var video;
    if (!playing && (bounds.start || bounds.end)) {
      video = self.video;
      var t = video.currentTime;
      if (bounds.start && t < bounds.start) {
        video.currentTime = bounds.start;
      } else if (bounds.end && t > bounds.end) {
        video.currentTime = bounds.start || 0;
      }
    }
  };
}

angular
  .module('shotbyshot')
  .service('ShotVideoService', ShotVideoService);

