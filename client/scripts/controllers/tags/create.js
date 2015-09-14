(function(ng) {
  'use strict';

  ng.module('App').controller('Tags:Create', [
    '$scope', '$location', '$http', '$session', '$utils',

    function($scope, $location, $http, $session, $utils) {

      $scope.limit = 0;
      $scope.skip = 0;

      $scope.data = {
        tag: null
      };

      $scope.submit = function() {

        if (!$scope.selectedTag) {

          $scope.submitting = true;

          $http.post('/api/tags', {
            name: $scope.text
          }).

          success(function() {
            $location.path('/');
            $session.flash('success', 'Has creado un nuevo tag');
          }).
          error(function() {
            $scope.submitting = false;
            $session.flash('danger', 'Hubo un error creando el tag');
          });
        }
      };

      $scope.searchTags = function(tag) {

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          keywords = 'keywords=' + tag,
          tags = '/api/tags/like?' + limit + skip + keywords;

        return $http.get(tags).
        then(function(tags) {
          return (tags.data.length && tags.data.map(function(tag) {
            return tag.name;
          }));
        });

      };

      $scope.searchTextChange = function(text) {

        $scope.entries = (text && $scope.entries) || null;

      };

      $scope.searchByTag = function(tag) {

        if (!tag) {
          return;
        }

        $scope.searching = true;

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          tags = 'tags=' + tag,
          tasks = '/api/tasks/tags?' + limit + skip + tags,
          entries = '/api/entries/tags?' + limit + skip + tags,
          meetings = '/api/meetings/tags?' + limit + skip + tags;

        $http.get(entries).

        success(function(entries) {

          $http.get(tasks).

          success(function(tasks) {

            $http.get(meetings).

            success(function(meetings) {

              entries = entries.concat(tasks);
              entries = entries.concat(meetings);

              $scope.entries = $utils.quicksort(entries, 'created');

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
