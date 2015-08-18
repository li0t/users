(function(ng) {
  'use strict';

  ng.module('App').controller('Search:Index', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.keywords = null;
      $scope.limit = 0;
      $scope.skip = 0;

      $scope.search = function() {
        $scope.searching = true;

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          keywords = 'keywords=' + $scope.keywords;

        var query = '/api/entries/like?' + limit + skip + keywords;

        $http.get(query).

        success(function(entries) {
          console.log(entries);
          $scope.entries = entries;
        }).

        error(function(error) {
          console.log(error);
        }).

        finally(function() {
          $scope.searching = false;
        });
      };

    }
  ]);

}(angular));
