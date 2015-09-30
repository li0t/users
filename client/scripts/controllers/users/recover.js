/**
 * Recover User password.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Recover', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.submit = function() {

        $scope.submitting = true;

        $http.post('/api/interactions/user-recover', {
          email: $scope.form.email
        }).

        success(function(data) {

          $http.post('/api/mandrill/user-recover', {
            email: $scope.form.email,
            token: data.token
          }).

          success(function() {
            $location.path('/');
            $session.flash('success', 'Please check your email inbox. Dont forget to check the SPAM folder just in case.');
          }).

          error(function() {
            $session.flash('danger', 'Invalid Email! ... or something...');
          }).
          finally(function() {
            $scope.submitting = false;
          });
        }).
        error(function() {
          $scope.submitting = false;
          $session.flash('danger', 'Invalid Email! ... or something...');
        });
      };
    }
  ]);

}(angular));
