(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Meetings:Attendants', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.attendantsToRemove = [];
      $scope.meeting = $routeParams.meeting;
      $scope.fetching = null;

      $scope.fetch = function() {
        
        $scope.attendantsToRemove = [];
        $scope.fetching = true;

        $http.get('/api/meetings/' + $routeParams.meeting).

        success(function(meeting) {

          meeting.attendants.forEach(function(attendant) {
            if (attendant.user.email === $session.get('user').email) {

              if (attendant.user.profile.name) {
                attendant.user.profile.name += " (me)";
              } else {
                attendant.user.email += " (me)";
              }
            }
          });

          $scope.meeting = meeting;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.addOrRemove = function(attendant) {

        var indexOf = $scope.attendantsToRemove.indexOf(attendant);

        return (indexOf > -1) ?
          $scope.attendantsToRemove.splice(indexOf, 1):
          $scope.attendantsToRemove.push(attendant);

      };

      $scope.removeMembers = function() {

        $http.post('/api/meetings/attendants/remove-from/' + $routeParams.meeting, {
          attendants: $scope.attendantsToRemove
        }).

        success(function() {
          $scope.fetch();
          $session.flash('success', 'Asistentes eliminados con éxito!');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error elimando asistentes!');
        });
      };

      $scope.fetch();
    }
  ]);

}(angular));
