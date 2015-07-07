(function (ng) {
  'use strict';

  ng.module('App').controller('Entries:Detail', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {
      $scope.fetchingEntry = null;
      $scope.entry = null;

      $scope.fetch = function() {

        $scope.fetchingEntry = true;

        $http.get('/api/entries/' + $routeParams.id).

        success(function(data) {

          $scope.entry = data;

        }).

        finally(function(){
          $scope.fetchingEntry = false;

        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
