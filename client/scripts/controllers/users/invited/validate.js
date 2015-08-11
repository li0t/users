(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Invited:Validate', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $session.signout();
      $session.set('group', null);

      $session.flash('success', 'Bienvenido, porfavor llena el formulario!');

      $scope.submit = function() {

        $http.put('/api/users/invited/validate/' + $routeParams.token, { password: $scope.data.password }).

        success(function(token) {

          $http.put('/api/contacts/confirm/' + token).

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
      };
    }
  ]);

}(angular));
