(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetching = null;
      $scope.group = null;
      $scope.limit = 10;
      $scope.skip = 0;

      $scope.fetchGroup = function() {
        $scope.fetching = true;

        $http.post('/api/groups/set/' + $routeParams.id).

        success(function(data) {
          $scope.group = data;
          $session.set('group', data);

          $http.get('/api/entries/of/group/' + $session.get('group')._id + '?limit=' + $scope.limit + '&skip=' + $scope.skip).

          success(function(data) {
            $scope.entries = data;
          }).

          error(function() {
            $session.flash('danger', "Hubo un error obteniendo las entradas");
          }).

          finally(function() {
            $scope.fetching = false;
          });
        }).
        error(function() {
          $session.flash('danger', "Hubo un error la información del grupo");
        });
      };

      $scope.fetchGroup();

    }
  ]);

}(angular));
