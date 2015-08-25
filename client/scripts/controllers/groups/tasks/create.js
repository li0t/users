(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Tasks:Create', [
    '$scope', '$http', '$location', '$session', 'priorities', '$timeout',

    function($scope, $http, $location, $session, priorities, $timeout) {

      $scope.fetching = false;

      $scope.statics = {
        priorities: priorities.priorities
      };

      $scope.data = {
        group: $session.get('group')._id,
        collaborators: [],
        objetive: null,
        priority: null,
        tags: []
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

        $http.post('/api/tasks', $scope.data).

        success(function(task) {

          $http.post('/api/tasks/collaborators/add-to/' + task, $scope.data).

          success(function() {

            if ($scope.data.tags.lenght) {

              $http.post('/api/tasks/' + task + '/tags', $scope.data).

              success(function() {
                $location.path('/groups/' + $session.get('group')._id + '/tasks');
                $session.flash('success', 'Tarea creada con éxito!');
              }).

              error(function(data) {
                $session.flash('danger', data);
              });
            } else {
              $location.path('/groups/' + $session.get('group')._id + '/tasks');
              $session.flash('success', 'Tarea creada con éxito!');
            }
          }).

          error(function() {
            $session.flash('La tarea no pudo ser creada');
          });
        }).

        error(function() {
          $session.flash('La tarea no pudo ser creada');
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

      $scope.removeTag = function(tag) {
        var index = $scope.data.tags.indexOf(tag);
        if (index >= 0) {
          $scope.data.tags.splice(index, 1);
        }
      };

      $scope.searchTags = function(tag) {

        if (tag && tag.replace(/\s+/g, '').length) {

          var
            limit = 'limit=' + $scope.limit + '&',
            skip = 'skip=' + $scope.skip + '&',
            keywords = 'keywords=' + tag,
            tags = '/api/tags/like?' + limit + skip + keywords;

          return $http.get(tags).
          then(function(tags) {
            return (tags.data.length && tags.data) || $timeout(function() {
                return [{ name : tag}];
              }, 750);
          });
        }
      };

      $scope.selectedTagChange = function(tag) {

        tag = tag && tag.replace(/\s+/g, '');

        if (tag && tag.length) {

          var index = $scope.data.tags.indexOf(tag);
          if (index < 0) {
            $scope.data.tags.push(tag);
          }

          $scope.selectedTag = null;
          $scope.text = '';
        }
      };

      $scope.fetch();

    }
  ]);

}(angular));
