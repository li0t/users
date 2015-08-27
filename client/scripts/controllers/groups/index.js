(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Index', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {
      
      $scope.groups = null;
      $scope.fetching = false;

      $scope.loadGroups = function () {

        $scope.fetching = true;

        $http.get('/api/groups').

        success(function(groups) {
          $scope.groups = groups;
        }).

        finally(function(){
          $scope.fetching = false;
        });
      };

      $scope.loadGroups();
    }
  ]);

}(angular));
