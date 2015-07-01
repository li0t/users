(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Recover', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.fetchingEntries = null;
      $scope.entries = null;

      $scope.fetchEntries = function() {
        $scope.fetchingEntries = true;

        $http.get('/api/entries/group/' + $routeParams.id).

        success(function(data) {
          $scope.entries = data;
        }).

        finally(function() {
          $scope.fetchingEntries = false;
        });
      };

      $scope.fetchEntries();
    }
  ]);

}(angular));
