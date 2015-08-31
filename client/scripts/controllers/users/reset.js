/* global angular */

(function (ng) {
  'use strict';

  ng.module('App').controller('Users:Reset', [
    '$scope', '$http', '$location', '$routeParams', '$session',

    function ($scope, $http, $location, $routeParams, $session) {

      $scope.validating = true;

      $scope.submit = function () {

        $scope.submitting = true;

        $http.post('/api/users/reset/' + $routeParams.token, {
          password: $scope.form.password
        }).

        success(function () {
          $session.flash('Tu clave ha sido cambiada. Por favor inicia sesión con tu nueva clave.');
          $location.path('/');
        }).

        error(function () {
            $scope.submitting = false;
          $session.flash('No se ha podido reestablecer tu clave. Tal vez debas realizar una nueva solicitud de cambio.');
        });
    
      };
    }
  ]);

}(angular));
