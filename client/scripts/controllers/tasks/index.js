(function (ng) {
  'use strict';

  ng.module('App').controller('Tasks:Index', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.fetching = null;
      $scope.tasks = [];

      function removeDuplicates(arr) {

        var unique = {};
        var newArr = [];

        arr.forEach(function(item) {
          console.log(item);
          if (!unique[item._id]) {
            newArr.push(item);
            unique[item._id] = true;
          }
        });

        return newArr;
      }

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks').

        success(function(data) {
          $scope.tasks = (data);

          $http.get('/api/tasks/collaborators/me').

          success(function(data) {
            $scope.tasks = $scope.tasks.concat(data);
          }).
          finally(function() {
            $scope.tasks = removeDuplicates($scope.tasks);
            $scope.fetching = false;
          });
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
