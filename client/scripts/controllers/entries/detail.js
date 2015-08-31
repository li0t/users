(function (ng) {
  'use strict';

  ng.module('App').controller('Entries:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function ($scope, $http, $location, $session, $routeParams) {

      $scope.fetching = null;
      $scope.entry = null;
      $scope.group = null;

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/entries/' + $routeParams.id).

        success(function(data) {
          $scope.entry = data;
          $scope.group = data.group._id;
        }).

        finally(function(){
          $scope.fetching = false;

        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
