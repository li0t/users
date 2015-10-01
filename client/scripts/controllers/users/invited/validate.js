/**
 * Confirm Invited User email.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Invited:Validate', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $session.set('group', null);
      $session.signout();

      $session.flash('success', 'Bienvenido, porfavor llena el formulario!');

      $scope.submit = function() {

        $scope.submitting = true;

        $http.get('/api/tokens/' + $routeParams.secret).

        success(function(token) {

          $http.put('/api/users/invited/validate/' + token._id, { password: $scope.data.password }).

          success(function() {

            $http.put('/api/contacts/confirm/' + token._id).

            success(function() {
              $session.flash('success', 'Cuenta activada, bienvenido a emeeter!');
            }).

            error(function() {
              $session.flash('danger', 'This token is not valid!');
            }).
            finally(function() {
              $location.path('/');
            });
          }).
          error(function() {
            $location.path('/');
            $session.flash('danger', 'This token is not valid!');
          });
        }).
        error(function() {
          $location.path('/');
          $session.flash('danger', 'This token is not valid!');
        });
      };
    }
  ]);

}(angular));
