(function(ng) {
  'use strict';

  ng.module('App').controller('Meetings:Detail', [
    '$scope', '$http', '$location', '$session', '$route', '$routeParams',

    function($scope, $http, $location, $session, $route, $routeParams) {

      $scope.fetching = null;
      $scope.meeting = null;
      $scope.group = null;

      $scope.fetch = function() {
        $scope.fetching = true;

        $http.get('/api/meetings/' + $routeParams.id).

        success(function(data) {
          $scope.meeting = data;
          $scope.group = data.group._id;
          $scope.meeting.dateTime = data.dateTime && new Date(data.dateTime);
        }).

        error(function(data) {
          $location.path('/meetings/attendant');
          $session.flash('danger', data);
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.addItem = function(item) {

        $http.post('/api/meetings/items/add-to/' + $routeParams.id, {
          items: [item]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error agregando la item!');
        }).

        finally(function() {
          $scope.item = null;
        });
      };

      $scope.removeItem = function(item) {

        $http.post('/api/meetings/items/remove-from/' + $routeParams.id, {
          items: [item]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la item!');
        });
      };

      $scope.itemCompleted = function(item) {

        $http.put('/api/meetings/items/of/' + $routeParams.id + '/check', {
          items: [item]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error completando la item!');
        }).

        finally(function() {
          $scope.item = null;
        });
      };

      $scope.itemUncompleted = function(item) {

        $http.put('/api/meetings/items/of/' + $routeParams.id + '/uncheck', {
          items: [item]
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error eliminando la item!');
        });
      };

      $scope.toggleItem = function(item) {

        return !item.checked ?
          $scope.itemCompleted(item.description) :
          $scope.itemUncompleted(item.description);

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
