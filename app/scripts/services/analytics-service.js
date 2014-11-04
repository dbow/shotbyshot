'use strict';

/**
 * Service for tracking and analytics.
 * Right now, just a wrapper around GA.
 */
function AnalyticsService($window) {
  var self = this;

  /**
   * Sends a pageview with the given params if the ga object is available.
   *
   * @param {string} page to set for the pageview.
   * @param {string} title to set for the pageview.
   */
  this.pageview = function(page, title) {
    if (!$window['ga']) {
      return;
    }
    $window['ga']('send', 'pageview', {
      'page': page,
      'title': title
    });
  };
}

angular
  .module('shotbyshot')
  .service('AnalyticsService', AnalyticsService);


