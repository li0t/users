(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetching = null;
      $scope.task = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks/' + $routeParams.id).

        success(function(data) {
          $scope.task = data;
        }).

        error(function(data) {
          $location.path('/tasks');
          $session.flash('danger', data);
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.close = function() {

      };

      $scope.fetch();

    }
  ]);

}(angular));
