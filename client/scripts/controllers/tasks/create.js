(function(ng) {
  'use strict';

  ng.module('App').controller('Tasks:Create', [
    '$scope', '$location', '$http', '$session', 'priorities', '$timeout',

    function($scope, $location, $http, $session, priorities, $timeout) {

      $scope.statics = {
        priorities: priorities.priorities
      };

      $scope.data = {
        group: $session.get('user').group._id,
        objetive: null,
        priority: null,
        tags:  []
      };

      $scope.submit = function() {

        $http.post('/api/tasks', $scope.data).

        success(function(task) {

          $http.post('/api/tasks/collaborators/add-to/' + task, {
            collaborators: [$session.get('user')._id]
          }).

          success(function(task) {

            if ($scope.data.tags.lenght) {

              $http.post('/api/tasks/' + task + '/tags', $scope.data).

              success(function() {
                $location.path('/tasks/collaborator');
                $session.flash('success', 'Tarea creada con éxito!');
              }).

              error(function(data) {
                $session.flash('danger', data);
              });
            } else {
              $location.path('/tasks/collaborator');
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

    }

  ]);

}(angular));
