(function (ng) {
  'use strict';

  ng.module('App').controller('Users:Signin', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {
      $scope.error = false;
      $scope.submitting = false;

      $scope.submit = function () {
        $scope.submitting = true;
        $session.flash();

        $http.post('/api/users/signin', {
          email: $scope.form.email,
          password: $scope.form.password

        }).success(function (user) {
          $session.signin(user);
          $location.path('/');
          $session.flash('success', 'Welcome back ' + user.email + '!');

        }).error(function () {
          $session.flash('danger', 'Wrong email or password');

        }).finally(function () {
          $scope.submitting = false;
        });

      };
    }
  ]);

}(angular));
