(function(ng) {
  'use strict';

  ng.module('App').controller('Entries:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.examples =
      [{
        title: 'Imagen',
        type: 'image',
        href: '/entries/create/image'
      }, {
        title: 'Audio',
        type: 'audio',
        href: '/entries/create/audio'
      }, {
        title: 'Nota',
        type: 'note',
        href: '/entries/create/note'
      }, {
        title: 'Documento',
        type: 'document',
        href: '/entries/create/document'
      }];

    }
  ]);

}(angular));
