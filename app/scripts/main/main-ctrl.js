'use strict';

angular.module('shotbyshot')
  .controller('MainCtrl', function ($scope) {
    var annotations = $scope.annotations = [
      {
        title: 'Annotation #1',
        content: 'This is an annotation.',
        y: 0
      },
      {
        title: 'Annotation #2',
        content: 'This is an annotation.',
        y: 1
      },
      {
        title: 'Annotation #3',
        content: 'This is an annotation.',
        y: 2
      },
    ];

    var Scroller = {
      init: function () {
        this.height = window.innerHeight;

        window.addEventListener('scroll', this.onscroll);


        var annotationDivs = document.getElementsByClassName('annotation');

        angular.forEach(annotationDivs, function (annotation, i) {
          annotation.style.top = (i * Scroller.height) + 'px';
        });

        document.body.style.height = (this.height * annotations.length) + 'px';
      },

      onscroll: function () {
        var self = Scroller;

        var currentY = Math.floor(window.scrollY / self.height);
        var annotationDivs = document.getElementsByClassName('annotation');
        var annotationDiv;

        angular.forEach(annotations, function (annotation, i) {
          annotationDiv = annotationDivs[i];
          if (annotation.y <= currentY) {
            annotationDiv.classList.add('pin');
            annotationDiv.style.top = 0;
          } else {
            annotationDiv.classList.remove('pin');
            annotationDiv.style.top = (i * Scroller.height) + 'px';
          }
        });
      }
    };

    setTimeout(function () {
      Scroller.init();
    }, 0);
  });
