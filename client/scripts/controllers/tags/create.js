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
            $location.path('/');
            $session.flash('success', 'Has creado un nuevo tag');
          }).
          error(function() {
                        $scope.submitting = false;
            $session.flash('danger', 'Hubo un error creando el tag');
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
