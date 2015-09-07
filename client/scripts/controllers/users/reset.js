/* global angular */

(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Reset', [
    '$scope', '$http', '$location', '$routeParams', '$session',

    function($scope, $http, $location, $routeParams, $session) {

      $scope.submit = function() {

        $scope.submitting = true;

        $http.get('/api/tokens/' + $routeParams.secret).

        success(function(token) {

          $http.post('/api/users/reset/' + token._id, {
            password: $scope.form.password
          }).

          success(function() {
            $session.flash('Tu clave ha sido cambiada. Por favor inicia sesión con tu nueva clave.');
            $location.path('/');
          }).

          error(function() {
            $session.flash('No se ha podido reestablecer tu clave. Tal vez debas realizar una nueva solicitud de cambio.');
          }).
          finally(function() {
            $scope.submitting = false;
          });
        }).
        error(function() {
          $session.flash('No se ha podido reestablecer tu clave. Tal vez debas realizar una nueva solicitud de cambio.');
        });
      };
    }
  ]);

}(angular));
