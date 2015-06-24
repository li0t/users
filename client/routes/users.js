(function (ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function ($routeProvider) {

      $routeProvider.

      when('/users/signup', {
        controller: 'Users:Signup',
        templateUrl: '/templates/users/signup.html',
        resolve: {
          statics: [
            '$statics',

            function ($statics) {
              return $statics.get('genders');
            }
          ]
        }

      }).

      when('/users/recover', {
        controller: 'Users:Recover',
        templateUrl: '/templates/users/recover.html'

      }).

      when('/users/profile', {
        controller: 'Users:Profile',
        templateUrl: '/templates/users/profile.html'
      }).

      when('/users/reset/:secret', {
        controller: 'Users:Reset',
        templateUrl: '/templates/users/reset.html'

      });
    }

  ]);

}(angular));
