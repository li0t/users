(function(ng) {
  'use strict';

  ng.module('App').controller('Meetings:Create', [
    '$scope', '$location', '$http', '$session',

    function($scope, $location, $http, $session) {

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

        $scope.submitting = true;

        $http.post('/api/meetings', $scope.data).

        success(function(meeting) {

          $session.flash('success', 'La reunión ha sido creada');

          $http.post('/api/meetings/attendants/add-to/' + meeting, $scope.data).

          success(function() {

            $scope.data.attendants.forEach(function(attendant) {

              if (attendant !== $session.get('user')._id) {

                $http.post('/api/interactions/meeting-attendance', {
                  meeting: meeting,
                  receiver: attendant
                }).

                error(function() {
                  $session.flash('danger', 'Hubo un problema agregando tags a la reunión');

                });
              }
            });

            if ($scope.data.tags.length) {

              $http.post('/api/meetings/tags/add-to/' + meeting, $scope.data).

              error(function() {
                $session.flash('danger', 'Hubo un problema agregando tags a la reunión');
              });
            }
          }).
          error(function() {
            $session.flash('danger', 'Hubo un problema agregando asistentes a la reunión');
          }).
          finally(function() {
            $location.path('/meetings/creator');
          });
        }).
        error(function() {
          $scope.submitting = false;
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

      $scope.searchTags = function(tag) {

        var
          limit = 'limit=' + $scope.limit + '&',
          skip = 'skip=' + $scope.skip + '&',
          keywords = 'keywords=' + tag + '&',

          tags = '/api/tags/like?' + keywords + limit + skip;

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
