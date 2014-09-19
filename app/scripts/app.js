'use strict';

angular
  .module('shotbyshot',
          ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router'])
  .config(function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      })
      .state('shot', {
        url: '/shot/:shot',
        templateUrl: 'partials/shot.html',
        controller: 'ShotCtrl',
        controllerAs: 'shot'
      });

    $urlRouterProvider.otherwise('/');

     $sceDelegateProvider.resourceUrlWhitelist([
       // Allow same origin resource loads.
       'self',
       // Allow wordpress uploads.
       'http://www.memory.lossur.es/wp/wp-content/uploads/**',

       'player.vimeo.com/video/**'
     ]);
  });

