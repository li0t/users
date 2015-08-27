(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Members:Add', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.group = $routeParams.id;
      $scope.fetching = false;

      $scope.data = {
        members: []
      };

      function filterContacts(contacts, members) {

        var i, j;

        for (i = 0; i < contacts.length; i++) {
          for (j = 0; j < members.length; j++) {
            if (contacts[i].user.email === members[j].user.email) {
              contacts.splice(i, 1);
              i -= 1;
              break;
            }
          }
        }
        return contacts;
      }

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/contacts').

        success(function(contacts) {

          $http.get('/api/groups/members/of/' + $scope.group).

          success(function(members) {
            $scope.contacts = filterContacts(contacts, members);
          }).

          finally(function() {
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

      $scope.submit = function() {

        $http.post('/api/groups/members/add-to/' + $scope.group, $scope.data).

        success(function() {
          $session.flash('Miembros agregados');
        }).

        error(function() {
          $session.flash('Hubo un error agregando miembros');
        }).

        finally(function() {
          $location.path('/groups/' + $scope.group + '/members');
        });
      };

      $scope.fetch();

    }
  ]);

}(angular));
