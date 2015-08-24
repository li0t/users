(function (ng) {
  'use strict';

  ng.module('App').controller('Meetings:Creator', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.meetings = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/meetings').

        success(function(data) {
          $scope.meetings = data;
        }).

        finally(function() {
          $scope.fetching = false;
        });

      };

      $scope.fetch();
    }
  ]);

}(angular));
