(function (ng) {
  'use strict';

  ng.module('App').controller('Entries:Index', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.entries = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/entries/users/' + $session.get('user')._id).

        success(function(data) {
          $scope.entries = data;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
