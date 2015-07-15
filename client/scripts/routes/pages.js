/* global angular */

(function (ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function ($routeProvider) {

      $routeProvider.when('/', {
        templateUrl: '/assets/templates/pages/home.html'

      }).when('/help', {
        controller: 'Pages:Help',
        templateUrl: '/assets/templates/pages/help.html'

      }).when('/profile', {
        controller: 'Users:Profile',
        templateUrl: '/assets/templates/users/profile.html'

      }).when('/welcome', {
        controller: 'Pages:Dashboard',
        templateUrl: '/assets/templates/pages/welcome.html'

      });

    }

  ]);

}(angular));
