'use strict';

/**
 * Google Street View API Integration
 * Allows showing a street view image based on URL copied from Street View
 * application.
 * https://developers.google.com/maps/documentation/streetview/
 *
 * Copied over from
 * https://github.com/dbow/media-marginalia/blob/master/js/streetview.js
 */
function StreetViewService() {
  var self = this;

  var STREET_VIEW_HOST = '//maps.googleapis.com/maps/api/streetview?';
  var API_KEY = 'AIzaSyCru1EQFOIRQgaalFfc7TtJH0S6TosODQ4'; // TODO: Update with key.
  var protocol = API_KEY ? 'https:' : ''; // Must be https with API key.

  // Typical street view URL:
  // https://www.google.com/maps/@40.709973,-73.950954,3a,75y,97.1h,96.71t/data=!3m4!1e1!3m2!1sVVz-u8IKFVY8DMJ1ZJHnQg!2e0
  // /@[latitude],[longitude],[unknown],[fov]y,[heading]h,[pitch + 90]t/

  /**
   * Take a URL copy-pasted from the Street View application and parse into a
   * readable key/value map that can be used to interact with the Street View
   * API.
   *
   * Extracts latitude, longitude, fov, heading, and pitch.
   *
   * @param {string} url of Google Street View image to parse.
   * @param {string=} opt_size Optional size string to use.
   *
   * @return {Object} with parsed query params for Google Street View API.
   */
  this.parseStreetViewUrl = function(url, opt_size) {
    // Map of param key to value.
    var streetViewParams = {
      size: opt_size || '200x200',
      sensor: 'false'
    };

    var re = /www\.google\.com\/maps.*\/@([^\/]+)\//;
    var streetViewInfo = re.exec(url);
    if (!streetViewInfo) {
      return false;
    }

    streetViewInfo = streetViewInfo[1].split(',');
    streetViewParams.location = streetViewInfo[0] + ',' + streetViewInfo[1];
    streetViewParams.fov = parseInt(streetViewInfo[3].replace('y', ''), 10);
    streetViewParams.heading = parseFloat(streetViewInfo[4].replace('h', ''));
    streetViewParams.pitch = parseFloat(streetViewInfo[5].replace('t', '')) - 90;
    return streetViewParams;
  };


  /**
   * Take a map of params and assemble a Street View API URL.
   * @param {Object} streetViewParams object to use.
   * @return {string} The Street View API URL to load the image.
   */
  this.buildStreetViewAPIUrl = function(streetViewParams) {
    // Assemble URL.
    var params = [];
    for (var param in streetViewParams) {
      params.push(param + '=' + streetViewParams[param]);
    }
    if (API_KEY) {
      params.push('key=' + API_KEY);
    }
    return protocol + STREET_VIEW_HOST + params.join('&');
  };
}

angular
  .module('shotbyshot')
  .service('StreetViewService', StreetViewService);






