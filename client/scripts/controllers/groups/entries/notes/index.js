(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Notes', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.entries = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/entries/of/group/' + $session.get('group')._id + '/type/entry').

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