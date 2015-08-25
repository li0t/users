(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Images', [
    '$scope', '$http', '$location', '$session', 'Upload', '$timeout',

    function($scope, $http, $location, $session, $upload, $timeout) {

      $scope.filesSupported = 'image/*';
      $scope.files = [];

      $scope.data = {
        group: $session.get('group')._id,
        tags: []
      };

      $scope.discard = function($index) {
        $scope.files.splice($index, 1);
      };

      $scope.submit = function() {
        $scope.submitting = true;

        $scope.data.group = $session.get('group')._id;

        $http.post('/api/entries/', $scope.data).

        success(function(entry) {

          $upload.upload({
            url: '/api/entries/' + entry + '/pictures',
            file: $scope.files,
          }).

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
          error(function() {
            $session.flash('danger', "No crear la entrada");
          });
        }).
        error(function() {
          $session.flash('danger', 'Hubo un error creando la entrada');
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
              }, 750);
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
