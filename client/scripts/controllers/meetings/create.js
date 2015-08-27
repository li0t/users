(function(ng) {
  'use strict';

  ng.module('App').controller('Meetings:Create', [
    '$scope', '$location', '$http', '$session', '$timeout',

    function($scope, $location, $http, $session, $timeout) {

      $scope.sessionGroup = $session.get('group') && $session.get('group')._id;
      $scope.fetching = false;

      $scope.data = {
        attendants: [],
        items: [],
        tags: []
      };

      $scope.fetchGroupMembers = function() {

          $http.get('/api/groups/members/of/' + $scope.data.group).

          success(function(members) {

            $scope.groupMembers = members;

            $scope.data.attendants = members.map(function(member) {
              return member.user._id;
            });

          }).
          error(function() {
            $session.flash('danger', 'Hubo un error obteniendo los miembros del grupo');
          });

      };

      $scope.fetchGroups = function() {

        $scope.fetching = true;

        $http.get('/api/groups').

        success(function(groups) {
          $scope.groups = groups;
        }).

        finally(function() {
          $scope.fetching = false;
          $scope.data.group = $scope.sessionGroup;
          return $scope.data.group && $scope.fetchGroupMembers();
        });

      };

      $scope.submit = function() {

        $http.post('/api/meetings', $scope.data).

        success(function(meeting) {

          $http.post('/api/meetings/attendants/add-to/' + meeting, $scope.data).

          success(function() {

            if ($scope.data.tags.length) {

              $http.post('/api/meetings/' + meeting + '/tags', $scope.data).

              error(function(data) {
                $session.flash('danger', data);
              });
            }

            $session.flash('success', 'Reunión creada con éxito!');

          }).
          error(function() {
            $session.flash('danger', 'La reunión no pudo ser creada');
          }).
          finally(function() {
            $location.path('/meetings/creator');
          });
        }).
        error(function() {
          $session.flash('danger', 'La reunión no pudo ser creada');
        });
      };

      $scope.addItem = function(item) {
        $scope.data.items.push({
          description: item
        });
        $scope.item = null;
      };

      $scope.removeItem = function(index) {
        $scope.data.items.splice(index, 1);
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
