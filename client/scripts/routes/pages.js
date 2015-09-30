(function (ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function ($routeProvider) {

      $routeProvider.

      when('/', {
        controller: 'Pages:Home',
        templateUrl: '/assets/templates/pages/home.html'
      }).

      when('/help', {
        controller: 'Pages:Help',
        templateUrl: '/assets/templates/pages/help.html'
      }).

      when('/profile', {
        controller: 'Users:Profile',
        templateUrl: '/assets/templates/users/profile.html'
      }).

      when('/settings', {
        controller: 'Pages:Settings',
        templateUrl: '/assets/templates/pages/settings.html'

      }).

      when('/analitycs', {
        controller: 'Pages:Analitycs',
        templateUrl: '/assets/templates/pages/analitycs.html'
      });

    }

  ]);

}(angular));
