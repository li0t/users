(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Meetings:Attendants:Add', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.meeting = $routeParams.meeting;
      $scope.fetching = false;

      $scope.data = {
        attendants: []
      };

      function filterContacts(members, attendants) {
        var i, j;

        for (i = 0; i < members.length; i++) {
          for (j = 0; j < attendants.length; j++) {
            if (members[i].user.email === attendants[j].user.email) {
              members.splice(i, 1);
              i -= 1;
              break;
            }
          }
        }
        return members;
      }

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/groups/members/of/' + $session.get('group')._id).

        success(function(members) {

          $http.get('/api/meetings/' + $routeParams.meeting).

          success(function(meeting) {
            $scope.members = filterContacts(members, meeting.attendants);
          }).

          finally(function() {
            $scope.fetching = false;
          });
        });
      };

      $scope.submit = function() {

        $http.post('/api/meetings/attendants/add-to/' + $routeParams.meeting, $scope.data).

        success(function() {
          $location.path('/groups/' + $session.get('group')._id + '/meetings/' + $routeParams.meeting + '/attendants');
          $session.flash('Asistentes agregados');
        }).

        error(function() {
          $session.flash('Hubo un error agregando asistentes');
        });
      };

      $scope.attendants = {
        list: [],

        add: function add() {
          var item = $scope.members[$scope.form.attendant];

          if (this.list.indexOf(item) < 0) {
            this.list.push(item);
          }

          if ($scope.data.attendants.indexOf(item.user._id) < 0) {
            $scope.data.attendants.push(item.user._id);
          }

          $scope.form.attendant = '';
        },

        remove: function remove($index) {
          $scope.data.attendants.splice($index, 1);
          this.list.splice($index, 1);
        }
      };

      $scope.fetch();

    }
  ]);

}(angular));
