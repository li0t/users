/**
 * Get Meetings where session User is attendant.
 *
 * @type AngularJS Controller.
 */
(function (ng) {
  'use strict';

  ng.module('App').controller('Meetings:Attendant', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.meetings = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/meetings/attendants/me').

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
