(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Audios', [
    '$scope', '$http', '$location', '$session', 'Upload',

    function($scope, $http, $location, $session, $upload) {

      $scope.filesSupported = 'audio/*';
      $scope.files = [];

      $scope.data = {
        group: $session.get('group')._id
      };

      $scope.discard = function($index) {
        $scope.files.splice($index, 1);
      };

      $scope.submit = function() {
        $scope.fetching = true;

        $scope.data.group = $session.get('group')._id;

        $http.post('/api/entries/', $scope.data).

        success(function(entry) {

          $upload.upload({
            url: '/api/entries/' + entry + '/audios',
            file: $scope.files,
          }).

          success(function() {
            $session.flash('success', "Entrada Creada!");
          }).

          error(function() {
            $session.flash('danger', "No crear la entrada");
          }).

          finally(function() {
            $location.path('/groups/' + $session.get('group')._id + '/entries/audio');
          });
        }).
        error(function() {
          $session.flash('danger', 'Hubo un error creando la entrada');
        });
      };

    }
  ]);

}(angular));
