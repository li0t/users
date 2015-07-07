(function(ng) {
  'use strict';

  ng.module('App').controller('Contacts:Delete', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $http.delete('/api/contacts/' + $routeParams.id).

      success(function() {
        $location.path('/contacts');
        $session.flash('success', 'Contacto eliminado!');
      }).

      error(function() {
        $location.path('/contacts');
        $session.flash('danger', 'El contacto no ha podido ser eliminado!');
      });
    }

  ]);

}(angular));
