(function (ng) {
  'use strict';

  ng.module('App').controller('Tasks:Index', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.fetchingTasks = null;
      $scope.tasks = null;

      $scope.fetch = function() {
        $scope.fetchingTasks = true;

        $http.get('/api/tasks/me').

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
