(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetchingTask = null;
      $scope.task = null;

      $scope.fetch = function() {
        $scope.fetchingTask = true;

        $http.get('/api/tasks/' + $routeParams.task).

        success(function(data) {
          $scope.task = data;
        }).

        finally(function() {
          $scope.fetchingTask = false;
        });
      };

      $scope.fetch();

      $scope.close = function () {

      };

      $scope.reOpen = function () {

      };

    }
  ]);

}(angular));
