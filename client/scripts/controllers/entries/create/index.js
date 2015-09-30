/**
 * Set example data for new Entries.
 *
 * @type AngularJS Controller.
 */
(function(ng) {
  'use strict';

  ng.module('App').controller('Entries:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.examples =
      [{
        title: 'Imagen',
        type: 'image',
      }, {
        title: 'Audio',
        type: 'audio',
      }, {
        title: 'Nota',
        type: 'note',
      }, {
        title: 'Documento',
        type: 'document',
      }];

    }
  ]);

}(angular));
