(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.fetchingTask = null;
      $scope.task = null;

      $scope.fetch = function() {
        $scope.fetchingTask = true;

        $http.get('/api/tasks/' + $routeParams.task).

        success(function(data) {
          $scope.task = data;
        }).

        finally(function() {
          $scope.fetchingTask = false;
        });
      };

      $scope.fetch();

      $scope.close = function () {

        $http.put('/api/tasks/' + $routeParams.task + '/complete').

        success(function(data) {
          $location.path('/groups/' + $session.get('group')._id + '/tasks/' + $routeParams.task + '/detail');
          $session.flash('success', 'La tarea ha sido completada!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error completando la tarea!');
        }); 

      };

      $scope.reOpen = function () {
        $http.put('/api/tasks/' + $routeParams.task + '/re-open').

        success(function(data) {
          $location.path('/groups/' + $session.get('group')._id + '/tasks/' + $routeParams.task + '/detail');
          $session.flash('success', 'La tarea ha sido abierta!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error abriendo la tarea!');
        });
      };

    }
  ]);

}(angular));
