(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Members:Add', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function ($scope, $http, $location, $session, $routeParams) {

      $scope.fetching = false;
      $scope.data = {
        members: []
      };

      function filterContacts(groupMembers) {
        var i, j;

        for (i = 0; i < $scope.contacts.length; i++) {
          for (j = 0; j < groupMembers.length; j++) {
            if ($scope.contacts[i].user.email === groupMembers[j].user.email) {
              $scope.contacts.splice(i, 1);
              i -= 1;
              break;
            }
          }
        }
      }

      $scope.fetch = function () {

        $scope.fetching = true;

        $http.get('/api/contacts').

        success(function(data) {
          $scope.contacts = data;

          $http.get('/api/groups/members/of/' + $session.get('group')._id).

          success(function(data) {
            filterContacts(data);
          }).

          finally(function(){
            $scope.fetching = false;
          });
        });
      };

      $scope.members = {
        list: [],

        add: function add() {
          var item = $scope.contacts[$scope.form.member];

          if (this.list.indexOf(item) < 0) {
            this.list.push(item);
          }

          if ($scope.data.members.indexOf(item.user._id) < 0) {
            $scope.data.members.push(item.user._id);
          }

          $scope.form.member = '';
        },

        remove: function remove($index) {
          $scope.data.members.splice($index, 1);
          this.list.splice($index, 1);
        }
      };

      $scope.submit = function () {
        $http.post('/api/groups/members/add-to/' + $routeParams.id, $scope.data).
        success(function () {
          $session.flash('Miembros agregados');
          $location.path('/groups/' + $session.get('group')._id + '/members');
        }).
        error(function () {
          $session.flash('Hubo un error agregando miembros');
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
