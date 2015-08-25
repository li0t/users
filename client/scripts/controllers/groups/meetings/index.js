(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Meetings', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetching = null;
      $scope.meetings = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/meetings/of/group/' + $routeParams.id).

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
