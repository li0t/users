(function(ng) {
  'use strict';

  ng.module('App').controller('Search:Index', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.user = null;

      $scope.search = function() {

        $http.post('/api/search/email', $scope.data).

        success(function(user) {
          $scope.user = user;
        }).

        error(function(data, status) {
          if (status === 404) {
            if (confirm('Usuario no encontrado, desea invitarlo a emeeter?')) {

              $http.post('/api/users/invited', $scope.data).

              success(function() {
                $location.path('/');
                $session.flash('success', 'Usuario invitado');
              }).

              error(function(data) {
                $session.flash('warning', data);
              });
            }
          }
          $session.flash('warning', data);
        });

      };

    }
  ]);

}(angular));
