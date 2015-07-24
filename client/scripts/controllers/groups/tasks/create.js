(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Create', [
    '$scope', '$http', '$location', '$session', 'priorities',

    function ($scope, $http, $location, $session, priorities) {

      $scope.statics = {
        priorities: priorities.priorities
      };
      
      $scope.data = {
        group: $session.get('group')._id,
        objetive: null,
        priority: null
      };

      $scope.submit = function () {
        $http.post('/api/tasks', $scope.data).
        success(function () {
          $session.flash('Tarea creada');
          $location.path('/groups/'  +$session.get('group')._id + '/tasks');
        }).
        error(function () {
          $session.flash('La tarea no pudo ser creada');
        });
      };

    }
  ]);

}(angular));
