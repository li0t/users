(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {
      $scope.fetching = null;
      $scope.group = null;

      $scope.fetchGroup = function() {
        $scope.fetching = true;

        $http.post('/api/groups/set/' + $routeParams.id).

        success(function(data) {
          $scope.group = data;
          $session.set('group', data);
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.fetchGroup();

    }
  ]);

}(angular));
