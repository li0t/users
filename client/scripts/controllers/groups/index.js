/**
 * Get all session User Groups.
 *
 * @type AngularJS Controller.
 */
(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Index', [
    '$scope', '$http', '$location', '$session', '$q', '$timeout',

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
