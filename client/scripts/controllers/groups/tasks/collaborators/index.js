(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Collaborators', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.collaboratorsToRemove = [];
      $scope.task = $routeParams.task;
      $scope.fetching = null;

      $scope.fetch = function() {
        $scope.collaboratorsToRemove = [];
        $scope.fetching = true;

        $http.get('/api/tasks/' + $routeParams.task).

        success(function(task) {

          task.collaborators.forEach(function(collaborator) {
            if (collaborator.user.email === $session.get('user').email) {

              if (collaborator.user.profile.name) {
                collaborator.user.profile.name += " (me)";
              } else {
                collaborator.user.email += " (me)";
              }
            }
          });

          $scope.task = task;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.addOrRemove = function(collaborator) {

        var indexOf = $scope.collaboratorsToRemove.indexOf(collaborator);

        return (indexOf > -1) ?
          $scope.collaboratorsToRemove.splice(indexOf, 1):
          $scope.collaboratorsToRemove.push(collaborator);

      };

      $scope.removeMembers = function() {

        $http.post('/api/tasks/collaborators/remove-from/' + $routeParams.task, {
          collaborators: $scope.collaboratorsToRemove
        }).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'Colaboradores eliminados con éxito!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error elimando colaboradores!');
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
