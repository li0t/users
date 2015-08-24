(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Creator', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.tasks = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks').

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
