(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Create', [
    '$scope', '$location', '$http', '$session', 'priorities',

    function($scope, $location, $http, $session, priorities) {

      $scope.statics = {
        priorities: priorities.priorities
      };

      $scope.data = {
        group: $session.get('user').group._id,
        objetive: null,
        priority: null
      };

      $scope.submit = function() {

        $http.post('/api/tasks', $scope.data).

        success(function(task) {

          $http.post('/api/tasks/collaborators/' + task, {
            collaborators: [$session.get('user')._id]
          }).

          success(function() {
            $session.flash('Tarea creada');
            $location.path('/tasks/collaborator');
          }).

          error(function() {
            $session.flash('La tarea no pudo ser creada');
          });
        }).
        error(function() {
          $session.flash('La tarea no pudo ser creada');
        });
      };

    }

  ]);

}(angular));
