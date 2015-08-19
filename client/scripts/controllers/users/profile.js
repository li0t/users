(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams', 'statics',

    function($scope, $http, $location, $session, $routeParams, statics) {

      $scope.statics = statics;
      $scope.fetching = false;
      $scope.user = null;

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/users/' + $routeParams.id).

        success(function(user) {
          user.profile.birthdate = user.profile.birthdate && new Date(user.profile.birthdate);
          $scope.user = user;
        }).

        error(function() {
          $session.flash('danger', "Hubo error obteniendo la información del usuario");
        }).
        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.submit = function() {
        $scope.submitting = true;

        $http.put('/api/users/profiles', $scope.user.profile).

        error(function() {
          $scope.fetch();
          $session.flash('danger', "Hubo error actualizando la información del usuario");
        }).
        finally(function() {
          $scope.submitting = false;
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
