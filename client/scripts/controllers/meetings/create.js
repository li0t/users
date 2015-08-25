(function(ng) {
  'use strict';

  ng.module('App').controller('Meetings:Create', [
    '$scope', '$location', '$http', '$session', '$timeout',

    function($scope, $location, $http, $session, $timeout) {

      $scope.fetching = false;

      $scope.data = {
        attendants: [$session.get('user')._id],
        tags: []
      };

      $scope.fetchGroupMembers = function() {

        if ($scope.data.group) {

          $http.get('/api/groups/members/of/' + $scope.data.group).

          success(function(members) {
            $scope.members = members.filter(function(member) {
              return member.user._id !== $session.get('user')._id;
            });
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

          success(function(meeting) {

            if ($scope.data.tags.length) {

              $http.post('/api/meetings/' + meeting + '/tags', $scope.data).

              success(function() {
                $location.path('/meetings/creator');
                $session.flash('success', 'Reunión creada con éxito!');
              }).

              error(function(data) {
                $session.flash('danger', data);
              });
            } else {
              $location.path('/meetings/creator');
              $session.flash('success', 'Reunión creada con éxito!');
            }
          }).
          error(function() {
            $session.flash('danger', 'La reunión no pudo ser creada');
          });
        }).
        error(function() {
          $session.flash('danger', 'La reunión no pudo ser creada');
        });
      };

      $scope.attendants = {
        list: [{
          user: $session.get('user')
        }],

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

      $scope.fetchGroups();

    }

  ]);

}(angular));
