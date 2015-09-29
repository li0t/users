(function(ng) {
  'use strict';

  ng.module('App').controller('Entries:Create:Notes', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.sessionGroup = $session.get('group') && $session.get('group')._id;
      $scope.data = {
        group: null,
        tags: []
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
          $scope.data.group = $scope.sessionGroup;
          $scope.fetching = false;
        });

      };

      $scope.submit = function() {

        $scope.submitting = true;

        $http.post('/api/entries', $scope.data).

        success(function(entry) {

          $location.path('/');
          $session.flash('success', 'La nota ha sido creada');

          if ($scope.data.tags.length) {

            $http.post('/api/entries/tags/add-to/' + entry, $scope.data).

            error(function() {
              $session.flash('danger', 'Hubo un error agregando tags a la nota!');
            });
          }
        }).
        error(function(data) {
          $session.flash('danger', data);
          $scope.submitting = false;
        });

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
