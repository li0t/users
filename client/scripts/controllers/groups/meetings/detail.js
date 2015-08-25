(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Detail', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {
      
      $scope.fetching = null;
      $scope.meeting = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/meetings/' + $routeParams.meeting).

        success(function(data) {
          $scope.meeting = data;
          $scope.meeting.dateTime = data.dateTime && new Date(data.dateTime);
        }).

        error(function(data) {
          $location.path($routeParams.id +  '/meetings');
          $session.flash('danger', data);
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.addNote = function(note) {

        $http.post('/api/meetings/notes/add-to/' + $routeParams.meeting, {
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

        $http.post('/api/meetings/notes/remove-from/' + $routeParams.meeting, { notes: [note] }).

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

      $scope.editDateTime = function() {

        $http.put('/api/meetings/' + $routeParams.meeting + '/date-time' , {
          dateTime: $scope.meeting.dateTime
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error editando la reunión!');
        }).

        finally(function() {
            $scope.dateTimeChanged = null;
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
