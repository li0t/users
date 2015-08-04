(function(ng) {
  'use strict';

  ng.module('App').controller('Entries:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      $scope.isDisabled = false;
      $scope.selectedTag = null;
      $scope.tags = loadTags();
      $scope.searchTag = null;

      $scope.data = {
        group: $session.get('user').group._id
      };

      /**
       * Create filter function for a query string
       */
      function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(item) {
          return (item.value.indexOf(lowercaseQuery) === 0);
        };
      }

      function loadTags() {
        /* MOCK DATA */
        var tags = [

          {
            'name': 'final'
          }, {
            'name': 'emeeter'
          }, {
            'name': 'test'
          }, {
            'name': 'doh'
          }

        ];

        return tags.map(function(tag) {
          tag.value = tag.name;
          return tag;
        });
      }

      $scope.tagSearch = function(text) {

        var query = (text) ? $scope.tags.filter(createFilterFor(text)) : $scope.tags;
        return query;

      };

      $scope.submit = function() {

        $http.post('/api/entries', $scope.data).

        success(function() {
          $location.path('/entries');
          $session.flash('success', 'Entrada creada con éxito!');
        }).

        error(function(data) {
          $session.flash('danger', data);
        });
      };
    }
  ]);

}(angular));
