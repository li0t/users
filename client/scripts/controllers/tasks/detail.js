(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$route', '$routeParams',

    function($scope, $http, $location, $session, $route, $routeParams) {

      $scope.fetching = null;
      $scope.group = null;
      $scope.task = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/tasks/' + $routeParams.id).

        success(function(data) {
          $scope.task = data;
          $scope.group = data.group._id;
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

      $scope.addActivity = function(activity) {

        $http.post('/api/tasks/activities/add-to/' + $routeParams.id, {
          activities: [activity]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error agregando la actividad!');
        }).

        finally(function() {
          $scope.activity = null;
        });
      };

      $scope.removeActivity = function(activity) {

        $http.post('/api/tasks/activities/remove-from/' + $routeParams.id, {
          activities: [activity]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la actividad!');
        });
      };

      $scope.activityCompleted = function(activity) {

        $http.put('/api/tasks/activities/of/' + $routeParams.id + '/check', {
          activities: [activity]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error completando la actividad!');
        }).

        finally(function() {
          $scope.activity = null;
        });
      };

      $scope.activityUncompleted = function(activity) {

        $http.put('/api/tasks/activities/of/' + $routeParams.id + '/uncheck', {
          activities: [activity]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la actividad!');
        });
      };

      $scope.toogleActivity = function(activity) {

        return !activity.checked ?
          $scope.activityCompleted(activity.description) :
          $scope.activityUncompleted(activity.description);

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
