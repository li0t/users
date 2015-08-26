(function(ng) {
  'use strict';

  ng.module('App').controller('Search:Index', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.keywords = null;
      $scope.limit = 0;
      $scope.skip = 0;


      /** Bigger score, lower index  */
      function quicksort(array, left, right) {

        var index;

        if (array.length > 1) {

          left = (typeof left === 'number') ? left : 0;
          right = (typeof right === 'number') ? right : array.length - 1;

          index = partition(array, left, right);

          if (left < index - 1) {
            quicksort(array, left, index -1);
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

      $scope.search = function() {
        $scope.searching = true;

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          keywords = 'keywords=' + $scope.keywords,
          entries = '/api/entries/like?' + limit + skip + keywords,
          tasks = '/api/tasks/like?' + limit + skip + keywords;

        $http.get(entries).

        success(function(entries) {

          $http.get(tasks).

          success(function(tasks) {

            entries = entries.concat(tasks);
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
          console.log(error);
        });
      };

    }
  ]);

}(angular));
