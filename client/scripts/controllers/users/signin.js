/**
 * Sign in a User.
 *
 * @type AngularJS Controller.
 */
(function (ng) {
  'use strict';

  ng.module('App').controller('Users:Signin', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.error = false;

      $scope.submit = function () {

        $scope.submitting = true;
        $session.flash();

        $http.post('/api/users/signin', {
          email: $scope.data.email,
          password: $scope.data.password
        }).

        success(function (user) {
          $session.signin(user);
          $location.path('/');
          $session.flash('success', 'Welcome back ' + user.email + '!');
        }).

        error(function () {
          $scope.submitting = false;
          $session.flash('danger', 'Wrong email or password');
        });

      };
    }
  ]);

}(angular));
