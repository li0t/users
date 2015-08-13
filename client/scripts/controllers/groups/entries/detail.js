(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) { 

      $scope.fetching = null;
      $scope.entry = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/entries/' + $routeParams.entry).

        success(function(data) {
          $scope.entry = data;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
