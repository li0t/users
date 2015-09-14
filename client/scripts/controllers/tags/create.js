(function(ng) {
  'use strict';

  ng.module('App').controller('Tags:Create', [
    '$scope', '$location', '$http', '$session',

    function($scope, $location, $http, $session) {

      $scope.limit = 0;
      $scope.skip = 0;

      $scope.data = {
        tag: null
      };

      /** Bigger score, lower index  */
      function quicksort(array, left, right) {

        var index;

        if (array.length > 1) {

          left = (typeof left === 'number') ? left : 0;
          right = (typeof right === 'number') ? right : array.length - 1;

          index = partition(array, left, right);

          if (left < index - 1) {
            quicksort(array, left, index - 1);
          }

          if (right > index) {
            quicksort(array, index, right);
          }

        }

        return array;
      }

      function partition(array, left, right) {

        var pivot = array[Math.floor((right + left) / 2)];

        while (left <= right) {

          while (array[left].score > pivot.score) {
            left++;
          }

          while (array[right].score < pivot.score) {
            right--;
          }

          if (left <= right) {
            swap(array, left, right);
            left++;
            right--;
          }
        }

        return left;
      }

      function swap(array, left, right) {
        var temp = array[left];
        array[left] = array[right];
        array[right] = temp;
      }

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
              $scope.entries = quicksort(entries);

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
