/**
* Tasks Main Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('emTask', [
    '$emCard', '$http',

    function ($emCard, $http) {

      return {
        restrict: 'E',

        templateUrl: '/assets/templates/tasks/sidenav.html',

        link: function ($scope, $element, $attrs) {

          // Explicit one-way sync between activeCard and $emCard service
          $scope.activeCard = $emCard.activeCard;

          if ($scope.activeCard.isCollaborator) {

            $scope.activeCard.isWorking = !!$scope.activeCard.isWorking;
            $scope.hasTimer = !$scope.activeCard.completed;

            $scope.toggleWorking = function(task) {

              $http.put('/api/tasks/' + task + '/worked-time').

              error(function() {
                console.log('Hubo un error con la tarea');
              });

            };
          }

          $scope.activityCompleted = function(activity) {

            $http.put('/api/tasks/activities/of/' + $scope.activeCard._id + '/check', {
              activities: [activity.description]
            }).

            success(function() {
              activity.checked = Date.now();
            }).

            error(function() {
              $session.flash('danger', 'Hubo un error completando la actividad!');
            }).

            finally(function() {
              $scope.activity = null;
            });
          };

          $scope.activityUncompleted = function(activity) {

            $http.put('/api/tasks/activities/of/' + $scope.activeCard._id + '/uncheck', {
              activities: [activity.description]
            }).

            success(function() {
              activity.checked = false;
            }).

            error(function() {
              $session.flash('danger', 'Hubo un error eliminando la actividad!');
            });

          };

          $scope.toggleActivity = function(activity) {

            return !activity.checked ?
            $scope.activityCompleted(activity) :
            $scope.activityUncompleted(activity);

          };

        }
      };
    }

  ]);

}(angular));
