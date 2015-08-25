(function(ng) {
  'use strict';

  ng.module('App').controller('Meetings:Detail', [
    '$scope', '$http', '$location', '$session', '$route', '$routeParams',

    function($scope, $http, $location, $session, $route, $routeParams) {

      $scope.fetching = null;
      $scope.meeting = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/meetings/' + $routeParams.id).

        success(function(data) {
          $scope.meeting = data;
          $scope.meeting.dateTime = data.dateTime && new Date(data.dateTime);
        }).

        error(function(data) {
          $location.path('/meetings/collaborator');
          $session.flash('danger', data);
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.addNote = function(note) {

        $http.post('/api/meetings/notes/add-to/' + $routeParams.id, {
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

        $http.post('/api/meetings/notes/remove-from/' + $routeParams.id, { notes: [note] }).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'Nota eliminada');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la nota!');
        });
      };

      $scope.editDateTime = function() {

        $http.put('/api/meetings/' + $scope.meeting._id + '/date-time' , {
          dateTime: $scope.meeting.dateTime
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
