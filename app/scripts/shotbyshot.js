'use strict';

angular.module('shotbyshot', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ui.router'])
  .config(function ($stateProvider, $urlRouterProvider) {
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
  })
;
