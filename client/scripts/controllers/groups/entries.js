/**
 * Get Entries of a Group.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) { /** TODO: add watch to reduce server calls */

      $scope.type = $routeParams.type;
      $scope.group = $routeParams.id;
      $scope.fetching = null;
      $scope.entries = null;
      $scope.limit = 0;
      $scope.skip = 0;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/entries/of/group/' + $scope.group + '?limit=' + $scope.limit).

        success(function(data) {

          /** If type is set, filter entries */
          $scope.entries =
            (!$scope.type) ?
            data :
            data.filter(function(entry) {
              return entry.type === $scope.type;
            });
        }).

        error(function() {
          $session.flash('danger', "Hubo un error obteniendo las entradas");
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
