'use strict';

angular.module('shotbyshot')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      {
        'key': 'angular',
        'title': 'AngularJS',
        'url': 'https://angularjs.org/',
        'description': 'HTML enhanced for web apps!',
        'logo': 'angular.png'
      },
      {
        'key': 'browsersync',
        'title': 'BrowserSync',
        'url': 'http://browsersync.io/',
        'description': 'Time-saving synchronised browser testing.',
        'logo': 'browsersync.png'
      },
      {
        'key': 'gulp',
        'title': 'GulpJS',
        'url': 'http://gulpjs.com/',
        'description': 'The streaming build system.',
        'logo': 'gulp.png'
      },
      {
        'key': 'jasmine',
        'title': 'Jasmine',
        'url': 'http://jasmine.github.io/',
        'description': 'Behavior-Driven JavaScript.',
        'logo': 'jasmine.png'
      },
      {
        'key': 'karma',
        'title': 'Karma',
        'url': 'http://karma-runner.github.io/',
        'description': 'Spectacular Test Runner for JavaScript.',
        'logo': 'karma.png'
      },
      {
        'key': 'protractor',
        'title': 'Protractor',
        'url': 'https://github.com/angular/protractor',
        'description': 'End to end test framework for AngularJS applications built on top of WebDriverJS.',
        'logo': 'protractor.png'
      },
      {
        'key': 'ruby-sass',
        'title': 'Sass (Ruby)',
        'url': 'http://sass-lang.com/',
        'description': 'Original Syntactically Awesome StyleSheets implemented in Ruby',
        'logo': 'ruby-sass.png'
      }
    ];
    angular.forEach($scope.awesomeThings, function(awesomeThing) {
      awesomeThing.rank = Math.random();
    });

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
