(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.group = $routeParams.id;
      $scope.fetching = null;
      $scope.tasks = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks/of/group/' + $scope.group).

        success(function(data) {
          $scope.tasks = data;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
