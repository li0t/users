(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Members', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function ($scope, $http, $location, $session, $routeParams) {

      $scope.fetchingMembers = null;
      $scope.members = null;

      $scope.fetchMembers = function() {
        $scope.fetchingMembers = true;

        $http.get('/api/groups/members/' + $routeParams.id).

        success(function(data){
          $scope.members = data;
        }).

        finally(function(){
          $scope.fetchingMembers = false;
        });
      };

      $scope.fetchMembers();
    }
  ]);

}(angular));
