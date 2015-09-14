/**
* Tasks Main Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('emTaskSidenav', [
    '$emCard', '$http', '$session', '$moment',

    function ($emCard, $http, $session, $moment) {

      return {
        restrict: 'E',

        templateUrl: '/assets/templates/tasks/sidenav.html',

        link: function ($scope, $element, $attrs) {

          // Explicit sync between activeCard and $emCard service
          $scope.activeCard = $emCard.activeCard;

          if ($scope.activeCard.isCollaborator) {

            $scope.activeCard.isWorking = !!$scope.activeCard.isWorking;
            $scope.hasTimer = !$scope.activeCard.completed;

            $scope.toggleWorking = function(task) {

              $http.put('/api/tasks/' + task + '/worked-time').

              error(function() {
                console.log('No se ha podido rescatar el tiempo trabajado en esta tarea.');
              });

            };
          }

          $scope.showWorkedTime = function () {
            $scope.activeCard.collaborators.forEach(function (element, index, array) {

              var init, end;
              var worked = 0;
              var totalTime = 0;

              for (var i = 0; i < element.workedTimes.length; i ++) {

                if (i % 2 == 0) {

                  //init = $moment().valueOf(element.workedTimes[i]);
                  init = element.workedTimes[i];

                  if (typeof element.workedTimes[i + 1] === 'undefinded') {

                    end = Date.now();

                  } else {

                    //end = $moment().valueOf(element.workedTimes[i + 1]);
                    end = element.workedTimes[i + 1];

                  }

                  console.log(init, ' : ' , end);
                  worked = $moment().subtract(end, init).milliseconds();
                  totalTime = totalTime + worked;

                  console.log(worked, totalTime);

                }

              }

              array[index].totalTime = totalTime;

            });
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

          $scope.closeTask = function() {

            $http.put('/api/tasks/close/' + $scope.activeCard._id).

            success(function() {
              $scope.activeCard.completed = Date.now();
              $session.flash('success', 'La tarea ha sido completada!');
            }).

            error(function() {
              $session.flash('danger', 'Hubo un error completando la tarea!');
            });

          };

          $scope.reOpenTask = function() {
            $http.put('/api/tasks/re-open/' + $scope.activeCard.id).

            success(function() {
              $scope.activeCard.completed = false;
              $session.flash('success', 'La tarea ha sido abierta!');
            }).

            error(function() {
              $session.flash('danger', 'Hubo un error abriendo la tarea!');
            });
          };

        }
      };
    }

  ]);

}(angular));
