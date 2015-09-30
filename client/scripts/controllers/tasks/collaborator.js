/**
 * Get Tasks where session User is collaborator.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Collaborator', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.tasks = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks/collaborators/me').

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
