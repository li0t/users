(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Validate', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {
      $http.put('/api/users/validate/' + $routeParams.token).

      success(function() {

        $http.get('/api/session').

        success(function(data) {
          $session.signin(data.user);
          $session.flash('success', 'Bienvenido a emeeter!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error!');
        }).

        finally(function() {
          $location.path('/');
        });
      }).
      error(function() {
        $session.flash('danger', 'Token inválido!');
      });

    }
  ]);

}(angular));
