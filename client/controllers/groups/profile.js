(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function ($scope, $http, $location, $session, $routeParams) {
       $scope.fetchingGroup = null;
       $scope.group = null;



       $scope.fetchGroup = function () {
         $scope.fetchingGroup = true;

         $http.get('/api/group/' + $routeParams.id).

         success(function(data){
           $scope.group = data;
           $session.set('group', data);
         }).

         finally(function(){
           $scope.fetchingGroup = false;
         });
       };





       $scope.fetchGroup();



    }
  ]);

}(angular));
