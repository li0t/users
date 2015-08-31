/* global angular */

(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Create', [
    '$scope', '$location', '$http', '$session',

    function($scope, $location, $http, $session) {

      $scope.posibleMembers = [];

      $scope.fetch = function() {

        $scope.fetching = true;
        $http.get('/api/contacts').

        success(function(contacts) {
          $scope.posibleMembers = contacts;
        }).

        error(function() {
          $session.flash('Hubo un error obteniendo los contactos');
        }).

        finally(function() {
          $scope.fetching = false;
        });

      };

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

      $scope.submit = function() {

        $scope.submitting = true;

        $http.post('/api/groups', $scope.data).

        success(function() {
          $location.path('/groups');
          $session.flash('Grupo creado');
        }).

        error(function() {
          $scope.submitting = false;
          $session.flash('El grupo no pudo ser creado');
        });

      };

      $scope.fetch();

    }

  ]);

}(angular));
