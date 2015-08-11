/* global angular */

(function (ng) {
  'use strict';

  ng.module('App').controller('Groups:Create', [
    '$scope', '$location', '$http', '$session', 'posibleMembers',

    function ($scope, $location, $http, $session, posibleMembers) {

      $scope.posibleMembers = posibleMembers.data;

      $scope.data = {
        name: null,
        members: []
      };

      $scope.members = {
        list: [],

        add: function add() {
          var item = $scope.posibleMembers[$scope.form.member];

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
        $http.post('/api/groups', $scope.data).
        success(function () {
          $session.flash('Grupo creado');
          $location.path('/groups');
        }).
        error(function () {
          $session.flash('El grupo no pudo ser creado');
        });
      };

    }

  ]);

}(angular));
