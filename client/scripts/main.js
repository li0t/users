(function (ng) {
  'use strict';

  ng.module('App').

  config([
    '$routeProvider', '$locationProvider', '$mdThemingProvider',

    function ($routeProvider, $locationProvider, $mdThemingProvider) {
      $locationProvider.html5Mode(true);

      $mdThemingProvider.theme('default').
      primaryPalette('blue-grey').
      accentPalette('light-green');
    }
  ]).

  constant('APP_NAME', "emeeter").
  constant('YEAR', new Date().getFullYear()).
  constant('DOMAIN', 'https://github.com/finaldevstudio/fi-seed').

  run([
    '$rootScope', '$http', '$session', '$location', 'APP_NAME', 'YEAR', 'DOMAIN',

    function ($rootScope, $http, $session, $location, APP_NAME, YEAR, DOMAIN) {
      /* Constants set */
      $rootScope.APP_NAME = APP_NAME;
      $rootScope.DOMAIN = DOMAIN;
      $rootScope.YEAR = YEAR;

      $http.get('/api/session').

      success(function(user) {
        $session.signin(user);
      }).

      finally(function() {
        $location.path('/');
      });


      /* Convenience navigate to method */
      $rootScope.$navigateTo = function (route) {
        $location.path(route);
      };

      /* Convenience navigate to method */
      $rootScope.$signout = function () {
        $session.signout();
      };

    }
  ]);

}(angular));
