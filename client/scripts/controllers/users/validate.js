/**
 * Confirm User email.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Validate', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $http.get('/api/tokens/' + $routeParams.secret).

      success(function(token) {

        $http.put('/api/users/validate/' + token._id).

        success(function() {

          $http.get('/api/session').

          success(function(data) {
            $session.signin(data.user);
            $session.flash('success', 'Bienvenido a emeeter!');
          }).

          error(function(data) {
            $session.flash('danger', data);
          }).
          finally(function() {
            $location.path('/');
          });
        }).
        error(function(data) {
          $location.path('/');
          $session.flash('danger', data);
        });
      }).
      error(function() {
        $location.path('/');
        $session.flash('danger', 'Token inválido!');
      });

    }
  ]);

}(angular));
