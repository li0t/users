(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Collaborators:Add', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.task = $routeParams.id;
      $scope.fetching = false;

      $scope.data = {
        collaborators: []
      };

      function filterContacts(members, collaborators) {
        var i, j;

        for (i = 0; i < members.length; i++) {
          for (j = 0; j < collaborators.length; j++) {
            if (members[i].user.email === collaborators[j].user.email) {
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

        $http.get('/api/tasks/' + $routeParams.id).

        success(function(task) {

        $http.get('/api/groups/members/of/' + task.group._id).

        success(function(members) {


            $scope.members = filterContacts(members, task.collaborators);
          }).

          finally(function() {
            $scope.fetching = false;
          });
        });
      };

      $scope.submit = function() {

        $http.post('/api/tasks/collaborators/add-to/' + $routeParams.id, $scope.data).

        success(function() {
          $location.path('/');
          $session.flash('Colaboradores agregados');
        }).

        error(function() {
          $session.flash('Hubo un error agregando colaboradores');
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
