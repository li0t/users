(function (ng) {
  'use strict';

  ng.module('App').controller('Group:Members:Index', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      $scope.fetchingMembers = null;
      $scope.members = null;

      $scope.fetchMembers = function() {
        $scope.fetchingMembers = true;

        $http.get('/api/groups/' + $routeParams.id + '/members').

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
