(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/users/signin', {
        controller: 'Users:Signin',
        templateUrl: '/templates/users/signin.html'
      }).


      when('/users/signup', {
        controller: 'Users:Signup',
        templateUrl: '/templates/users/signup.html',
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
        templateUrl: '/templates/users/recover.html'
      }).

      when('/users/validate/:token', {
        controller: 'Users:Validate',
        templateUrl: '/templates/pages/home.html'
      }).

      when('/users/reset/:token', {
        controller: 'Users:Reset',
        templateUrl: '/templates/users/reset.html'
      }).

      when('/users/:id/profile', {
        controller: 'Users:Profile',
        templateUrl: '/templates/users/profile.html'
      }).

      when('/users/invited/validate/:token', {
        controller: 'Users:Invited:Validate',
        templateUrl: '/templates/users/invited/validate.html'
      });
    }

  ]);

}(angular));
