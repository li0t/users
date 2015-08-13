(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.type = $routeParams.type;
      $scope.limit = 0;
      $scope.fetching = null;
      $scope.entries = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/entries/of/group/' + $session.get('group')._id + '?limit=' + $scope.limit).

        success(function(data) {

          /** If type is set, filter entries */
          $scope.entries =
          (!$scope.type) ?
            data :
            data.filter(function(entry) {
              return entry.type === $scope.type;
            });
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
