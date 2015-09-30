/**
 * Upload a new Document.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Entries:Create:Documents', [
    '$scope', '$http', '$location', '$session', 'Upload',

    function($scope, $http, $location, $session, $upload) {

      $scope.sessionGroup = $session.get('group') && $session.get('group')._id;
      $scope.filesSupported = 'application/*';
      $scope.files = [];

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

      $scope.discard = function($index) {
        $scope.files.splice($index, 1);
      };

      $scope.submit = function() {

        $scope.submitting = true;

        $http.post('/api/entries/', $scope.data).

        success(function(entry) {

          $upload.upload({
            url: '/api/entries/' + entry + '/documents',
            file: $scope.files,
          }).

          success(function() {

            $location.path('/');
            $session.flash('success', 'El documento ha sido subido!');

            if ($scope.data.tags.length) {

              $http.post('/api/entries/tags/add-to/' + entry, $scope.data).

              error(function() {
                $session.flash('danger', 'Hubo un error agregando tags al documento!');
              });
            }
          }).
          error(function() {
            $session.flash('danger', "Hubo un error subiendo el documento"); /** TODO: Rollback */
            $scope.submitting = false;
          });
        }).
        error(function() {
          $session.flash('danger', 'Hubo un error subiendo el documento');
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
