'use strict';

function AnnotationsService() {
  this.someMethod = function () {
  };
}

angular
  .module('shotbyshot')
  .service('AnnotationsService', AnnotationsService);
