(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$route', '$routeParams',

    function($scope, $http, $location, $session, $route, $routeParams) {

      $scope.fetching = null;
      $scope.task = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks/' + $routeParams.id).

        success(function(data) {
          $scope.task = data;
          $scope.task.dateTime = data.dateTime && new Date(data.dateTime);
        }).

        error(function(data) {
          $location.path('/tasks/collaborator');
          $session.flash('danger', data);
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.close = function() {

        $http.put('/api/tasks/close/' + $routeParams.id).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'La tarea ha sido completada!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error completando la tarea!');
        });

      };

      $scope.reOpen = function() {
        $http.put('/api/tasks/re-open/' + $routeParams.id).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'La tarea ha sido abierta!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error abriendo la tarea!');
        });
      };

      $scope.addNote = function(note) {

        $http.post('/api/tasks/notes/add-to/' + $routeParams.id, {
          notes: [note]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error agregando la nota!');
        }).

        finally(function() {
            $scope.note = null;
        });
      };

      $scope.removeNote = function(note) {

        $http.post('/api/tasks/notes/remove-from/' + $routeParams.id, { notes: [note] }).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'Nota eliminada');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la nota!');
        });
      };

      $scope.editDateTime = function() {

        $http.put('/api/tasks/' + $scope.task._id + '/date-time' , {
          dateTime: $scope.task.dateTime
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un editando la tarea!');
        }).

        finally(function() {
            $scope.dateTimeChanged = null;
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
