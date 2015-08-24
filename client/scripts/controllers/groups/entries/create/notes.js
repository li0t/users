(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Notes', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.data = {
        group: $session.get('group')._id,
        tags: []
      };

      $scope.submit = function() {

        $http.post('/api/entries', $scope.data).

        success(function(entry) {

          if ($scope.data.tags.length) {

            $http.post('/api/entries/' + entry + '/tags', $scope.data).

            success(function() {
              $session.flash('success', 'Entrada creada con éxito!');
            }).

            error(function(data) {
              $session.flash('danger', data);
            }).

            finally(function() {
              $location.path('/groups/' + $session.get('group')._id + '/entries/note');
            });

          } else {
            $location.path('/groups/' + $session.get('group')._id + '/entries/note');
            $session.flash('success', 'Entrada creada con éxito!');
          }
        }).
        error(function(data) {
          $session.flash('danger', data);
        });
      };

      $scope.removeTag = function(tag) {
        var index = $scope.data.tags.indexOf(tag);
        if (index >= 0) {
          $scope.data.tags.splice(index, 1);
        }
      };

      $scope.searchTags = function(tag) {

        tag = tag && tag.replace(/\s+/g, '');

        if (tag && tag.length) {

          var
            limit = 'limit=' + $scope.limit + '&',
            skip = 'skip=' + $scope.skip + '&',
            keywords = 'keywords=' + tag,
            tags = '/api/tags/like?' + limit + skip + keywords;

          return $http.get(tags).
          then(function(tags) {
            return (tags.data.length && tags.data) || [{ name : tag}];
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
