(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Documents', [
    '$scope', '$http', '$location', '$session', 'Upload',

    function($scope, $http, $location, $session, $upload) {

      $scope.filesSupported = 'application/*';
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
            url: '/api/entries/' + entry + '/documents',
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
            $session.flash('danger', "No se pudo crear la entrada");
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
