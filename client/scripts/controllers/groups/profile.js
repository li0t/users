(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {
      $scope.fetchingEntries = null;
      $scope.fetchingGroup = null;
      $scope.entriesLimit = 2;
      $scope.entries = null;
      $scope.group = null;

      $scope.fetchGroup = function() {
        $scope.fetchingGroup = true;

        $http.post('/api/groups/set/' + $routeParams.id).

        success(function(data) {
          $scope.group = data;
          $session.set('group', data);
        }).

        finally(function() {
          $scope.fetchingGroup = false;
        });
      };

      $scope.fetchEntries = function() {
        $scope.fetchingEntries = true;

        $http.get('/api/entries/of-group/'  + $routeParams.id ).

        success(function(data) {
          $scope.entries = data;
        }).

        finally(function() {
          $scope.fetchingEntries = false;
        });
      };

      $scope.fetchGroup();
      $scope.fetchEntries();

    }
  ]);

}(angular));
