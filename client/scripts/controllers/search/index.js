/**
 * Get all Entries, Meetings and Tasks where is present a word or several words.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Search:Index', [
    '$scope', '$http', '$location', '$session', '$utils',

    function($scope, $http, $location, $session, $utils) {

      $scope.keywords = null;
      $scope.limit = 0;
      $scope.skip = 0;

      $scope.search = function() {
        $scope.searching = true;

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          keywords = 'keywords=' + $scope.keywords,
          meetings = '/api/meetings/like?' + limit + skip + keywords,
          entries = '/api/entries/like?' + limit + skip + keywords,
          tasks = '/api/tasks/like?' + limit + skip + keywords;

        $http.get(entries).

        success(function(entries) {

          $http.get(tasks).

          success(function(tasks) {

            $http.get(meetings).

            success(function(meetings) {

              entries = entries.concat(tasks);
              entries = entries.concat(meetings);

              $scope.entries = $utils.quicksort(entries, 'score');

            }).
            error(function(error) {
              console.log(error);
            }).
            finally(function() {
              $scope.searching = false;
            });
          }).
          error(function(error) {
            $scope.searching = false;
            console.log(error);
          });
        }).
        error(function(error) {
          $scope.searching = false;
          console.log(error);
        });
      };

    }
  ]);

}(angular));
