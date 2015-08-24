(function(ng) {
  'use strict';

  ng.module('App').controller('Meetings:Create', [
    '$scope', '$location', '$http', '$session',

    function($scope, $location, $http, $session) {

      $scope.fetching = false;

      $scope.data = {
        attendants: [$session.get('user')._id]
      };

      $scope.fetchGroupMembers = function() {

        if ($scope.data.group) {

          $http.get('/api/groups/members/of/' + $scope.data.group).

          success(function(members) {
            $scope.members = members.filter(function(member) {
              return member.user._id !== $session.get('user')._id;
            });
            console.log($scope.members);
          }).
          error(function() {
            $session.flash('danger', 'Hubo un error obteniendo los miembros del grupo');
          });
        }
      };

      $scope.fetchGroups = function() {

          $scope.fetching = true;

          $http.get('/api/groups').

          success(function(groups) {
            $scope.groups = groups;
          }).

          finally(function() {
            $scope.fetching = false;
          });

      };

      $scope.submit = function() {

        $http.post('/api/meetings', $scope.data).

        success(function(task) {

          $http.post('/api/meetings/attendants/add-to/' + task, $scope.data).

          success(function() {

            $session.flash('Reunion creada');
          }).

          error(function() {
            $session.flash('La reunion no pudo ser creada');
          }).

          finally(function() {
            $location.path('/meetings/creator');
          });
        }).

        error(function() {
          $session.flash('La reunion no pudo ser creada');
        });
      };

      $scope.attendants = {
        list: [{ user: $session.get('user')}],

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

      $scope.fetchGroups();

    }

  ]);

}(angular));
