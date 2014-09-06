'use strict';

function AnnotationsService(Annotation) {
  /**
   * Parse an API response and return Annotation objects in an array.
   * @param {Array} posts to parse.
   * @return {Array.<Annotation>} Array of Annotation objects.
   */
  this.parse = function (posts) {
    var results = [];
    angular.forEach(posts, function(post) {
      results.push(new Annotation(post));
    });
    return results;
  };

  // TODO(dbow): AnnotationsService will offer a filter method to return only
  //     annotations matching some criteria (author / tag, presumably).
}

angular
  .module('shotbyshot')
  .service('AnnotationsService', AnnotationsService);
