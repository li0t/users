(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Recover', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      
      $scope.fetchingTasks = null;
      $scope.tasks = null;

      $scope.fetchTasks = function() {
        $scope.fetchingTasks = true;

        $http.get('/api/tasks/group/' + $routeParams.id).

        success(function(data) {
          $scope.tasks = data;
        }).

        finally(function() {
          $scope.fetchingTasks = false;
        });
      };

      $scope.fetchTasks();
    }
  ]);

}(angular));
