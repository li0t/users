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

          if ($scope.data.tags.length) {

            $http.post('/api/entries/' + entry + '/tags', $scope.data).

            error(function() {
              $session.flash('danger', 'Hubo un error agregando tags a la nota!');
            });
          }

          $session.flash('success', 'Entrada creada con éxito!');

        }).
        error(function(data) {
          $session.flash('danger', data);
        }).
        finally(function() {
          $scope.submitting = false;
          $location.path('/');
        });

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
