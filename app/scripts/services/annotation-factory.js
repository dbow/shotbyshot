'use strict';

function Annotation() {

  var annotation = {};

  annotation.someValue = '';

  annotation.someMethod = function () {
  };

  return annotation;
}

angular
  .module('shotbyshot')
  .factory('Annotation', Annotation);
