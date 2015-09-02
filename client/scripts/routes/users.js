(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/users/signin', {
        controller: 'Users:Signin',
        templateUrl: '/assets/templates/users/signin.html'
      }).


      when('/users/signup', {
        controller: 'Users:Signup',
        templateUrl: '/assets/templates/users/signup.html',
        resolve: {
          statics: [
            '$statics',

            function($statics) {
              return $statics.get('genders');
            }
          ]
        }
      }).

      when('/users/recover', {
        controller: 'Users:Recover',
        templateUrl: '/assets/templates/users/recover.html'
      }).

      when('/users/validate/:secret', {
        controller: 'Users:Validate',
        templateUrl: '/assets/templates/pages/home.html'
      }).

      when('/users/reset/:token', {
        controller: 'Users:Reset',
        templateUrl: '/assets/templates/users/reset.html',

      }).

      when('/users/:id/profile', {
        controller: 'Users:Profile',
        templateUrl: '/assets/templates/users/profile.html',
        resolve: {
          statics: [
            '$statics',

            function($statics) {
              return $statics.get('genders');
            }
          ]
        }
      }).

      when('/users/invited/validate/:secret', {
        controller: 'Users:Invited:Validate',
        templateUrl: '/assets/templates/users/invited/validate.html'
      });
    }

  ]);

}(angular));
