/* global angular */

(function(ng) {
  'use strict';

  ng.module('App').controller('Tags:Create', [
    '$scope', '$location', '$http', '$session',

    function($scope, $location, $http, $session) {

      $scope.data = {
        tag : null
      };

      $scope.submit = function() {

        if (!$scope.selectedTag) {

          $scope.submitting = true;

          $http.post('/api/tags', {name : $scope.text}).

          success(function() {
            $session.flash('danger', 'Has creado un nuevo tag');
          }).
          error(function() {
            $session.flash('danger', 'Hubo un error creando el tag');
          }).
          finally(function() {
            $scope.submitting = false;
            $location.path('/');
          });
        }
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

    }

  ]);

}(angular));
