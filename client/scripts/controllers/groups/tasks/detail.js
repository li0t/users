(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {
      $scope.fetching = null;
      $scope.members = null;
      $scope.task = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks/' + $routeParams.task).

        success(function(data) {
          $scope.task = data;

          $http.get('/api/groups/members/of/' + $routeParams.id).

          success(function(data) {
            $scope.members = data;
          }).

          error(function(data) {
            $location.path($routeParams.id +  '/tasks');
            $session.flash('danger', data);
          }).
          finally(function() {
            $scope.fetching = false;
          });
        }).
        error(function(data) {
          $location.path($routeParams.id +  '/tasks');
          $session.flash('danger', data);
        });
      };

      $scope.close = function() {

        $http.put('/api/tasks/close/' + $routeParams.task).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'La tarea ha sido completada!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error completando la tarea!');
        });

      };

      $scope.reOpen = function() {
        $http.put('/api/tasks/re-open/' + $routeParams.task).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'La tarea ha sido abierta!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error abriendo la tarea!');
        });
      };

      $scope.removeNote = function(note) {

        $http.post('/api/tasks/notes/remove-from/' + $routeParams.task, { notes: [note] }).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'Nota eliminada');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la nota!');
        }).

        finally(function() {
          note = "";
        });
      };

      $scope.addNote = function(note) {

        $http.post('/api/tasks/notes/add-to/' + $routeParams.task, {
          notes: [note]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error agregando la nota!');
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
