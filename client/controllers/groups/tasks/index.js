(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetchingTasks = null;
      $scope.tasks = null;

      $scope.fetch = function() {
        $scope.fetchingTasks = true;

        $http.get('/api/tasks/group/' + $routeParams.id).

        success(function(data) {
          $scope.tasks = data;
        }).

        finally(function() {
          $scope.fetchingTasks = false;
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
