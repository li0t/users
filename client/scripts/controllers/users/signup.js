(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Signup', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.submit = function() {

        $scope.submitting = true;
        $session.flash();

        $http.post('/api/users', {
          email: $scope.data.email,
          password: $scope.data.password

        }).

        success(function(user) {
          $http.post('/api/mandrill/signup', {
            id: user
          }).

          success(function() {
            $location.path('/');
            $session.flash('success', 'Te ha sido enviado un mail de confirmación');
          }).

          error(function(data) {
            $scope.submitting = false;
            $session.flash('danger', data);
          });
        }).

        error(function(data, status) {
          $scope.submitting = false;

          if (status === 409) {
            /* TODO: Mail already exists! do something! */
            $session.flash('warning', 'That email account is already registered. Do you need to recover your password?');
          } else if (status === 400) {
            /* TODO: Validation error ocurred! do something! */
            $session.flash('warning', 'You entered something invalid.');
          } else {
            /* TODO: Another error ocurred! do something! */
            $session.flash('danger', 'Emmmm... The server doen\'t seem to like you...');
          }
        });
      };
    }

  ]);

}(angular));
