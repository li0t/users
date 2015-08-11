(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Create', [
    '$scope', '$http', '$location', '$session', 'priorities',

    function($scope, $http, $location, $session, priorities) {

      $scope.fetching = false;

      $scope.statics = {
        priorities: priorities.priorities
      };

      $scope.data = {
        group: $session.get('group')._id,
        objetive: null,
        priority: null,
        collaborators: []
      };

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/groups/members/of/' + $session.get('group')._id).

        success(function(members) {
          $scope.members = members;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.submit = function() {

        $http.post('/api/tasks', $scope.data).

        success(function(task) {

          $http.post('/api/tasks/collaborators/add-to/' + task, $scope.data).

          success(function() {

            $session.flash('Tarea creada');
          }).

          error(function() {
            $session.flash('La tarea no pudo ser creada');
          }).

          finally(function() {
            $location.path('/groups/' + $session.get('group')._id + '/tasks');
          });
        }).

        error(function() {
          $session.flash('La tarea no pudo ser creada');
        });
      };

      $scope.collaborators = {
        list: [],

        add: function add() {
          var item = $scope.members[$scope.form.collaborator];

          if (this.list.indexOf(item) < 0) {
            this.list.push(item);
          }

          if ($scope.data.collaborators.indexOf(item.user._id) < 0) {
            $scope.data.collaborators.push(item.user._id);
          }

          $scope.form.collaborator = '';
        },

        remove: function remove($index) {
          $scope.data.collaborators.splice($index, 1);
          this.list.splice($index, 1);
        }
      };

      $scope.fetch();

    }
  ]);

}(angular));
