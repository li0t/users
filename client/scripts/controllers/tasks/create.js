(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Create', [
    '$scope', '$location', '$http', '$session', 'priorities',

    function($scope, $location, $http, $session, priorities) {

      $scope.sessionGroup = $session.get('group') && $session.get('group')._id;

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

          $scope.collaborators.list = [];
          $scope.data.collaborators = [];

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
          $scope.data.group = $scope.sessionGroup;
          return $scope.data.group && $scope.fetchGroupMembers();
        });

      };


      $scope.submit = function() {

        $scope.submitting = true;

        $http.post('/api/tasks', $scope.data).

        success(function(task) {

          $location.path('/tasks/creator');
          $session.flash('success', 'Tarea ha sido creada');

          if ($scope.data.collaborators.length) {

            $http.post('/api/tasks/collaborators/add-to/' + task, $scope.data).

            success(function() {

              $scope.data.collaborators.forEach(function(collaborator) {

                if (collaborator !== $session.get('user')._id) {

                  $http.post('/api/interactions/task-assigned', { task: task, receiver: collaborator }).
                  error(function(data) {
                    console.log(data);

                  });
                }
              });

            }).

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

        }).
        error(function() {
          $scope.submitting = false;
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

      $scope.addActivity = function(activity) {
        $scope.data.activities.push({
          description: activity
        });
        $scope.activity = null;
      };

      $scope.removeActivity = function(index) {
        $scope.data.activities.splice(index, 1);
      };

      $scope.searchTags = function(tag) {

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          keywords = 'keywords=' + tag,
          tags = '/api/tags/like?' + limit + skip + keywords;

        return $http.get(tags).
        then(function(tags) {
          return (tags.data.length && tags.data.map(function(tag) {
            return tag.name;
          }));
        });

      };

      $scope.fetchGroups();

    }

  ]);

}(angular));
