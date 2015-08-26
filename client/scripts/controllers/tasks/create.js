(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Create', [
    '$scope', '$location', '$http', '$session', 'priorities', '$timeout',

    function($scope, $location, $http, $session, priorities, $timeout) {

      $scope.statics = {
        priorities: priorities.priorities
      };

      $scope.data = {
        collaborators: [],
        activities: [],
        objetive: null,
        priority: null,
        group: null,
        tags: []
      };

      $scope.fetchGroupMembers = function() {

        if ($scope.data.group) {

          $http.get('/api/groups/members/of/' + $scope.data.group).

          success(function(members) {
            $scope.members = members;

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

          $scope.groups.unshift({
            _id: $session.get('user').group._id,
            profile: {
              name: 'Personal',
            }
          });
        }).

        finally(function() {
          $scope.fetching = false;
        });

      };


      $scope.submit = function() {

        $http.post('/api/tasks', $scope.data).

        success(function(task) {

          if ($scope.data.collaborators.length) {

            $http.post('/api/tasks/collaborators/add-to/' + task, $scope.data).

            error(function() {
              $session.flash('Hubo un error agregando colaboradores a la tarea, por favor inténtalo denuevo');
            });
          }

          if ($scope.data.tags.length) {

            $http.post('/api/tasks/tags/add-to/' + task, $scope.data).

            error(function() {
              $session.flash('Hubo un error agregando tags a la tarea, por favor inténtalo denuevo');
            });
          }

          $session.flash('success', 'Tarea creada con éxito!');
        }).
        error(function() {
          $session.flash('La tarea no pudo ser creada');
        }).
        finally(function() {
          $location.path('/tasks/creator');
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

      $scope.addActivity = function(activity) {
        $scope.data.activities.push({
          description: activity
        });
        $scope.activity = null;
      };

      $scope.removeActivity = function(index) {
        $scope.data.activities.splice(index, 1);
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
              return [{
                name: tag
              }];
            }, 600);
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

      $scope.fetchGroups();

    }

  ]);

}(angular));
