(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetchingEntry = null;
      $scope.entry = null;

      $scope.fetch = function() {
        $scope.fetchingEntry = true;

        $http.get('/api/entries/' + $routeParams.entry).

        success(function(data) {
          $scope.entry = data;
          console.log(JSON.stringify(data));
        }).

        finally(function() {
          $scope.fetchingEntry = false;
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
