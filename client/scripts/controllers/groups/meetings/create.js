(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Meetings:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.fetching = false;

      $scope.data = {
        group: $session.get('group')._id,
        objetive: null,
        attendants: []
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

        $http.post('/api/meetings', $scope.data).

        success(function(meeting) {

          $http.post('/api/meetings/attendants/add-to/' + meeting, $scope.data).

          success(function() {

            $session.flash('Tarea creada');
          }).

          error(function() {
            $session.flash('La tarea no pudo ser creada');
          }).

          finally(function() {
            $location.path('/groups/' + $session.get('group')._id + '/meetings');
          });
        }).

        error(function() {
          $session.flash('La tarea no pudo ser creada');
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
