(function(ng) {
  'use strict';

  ng.module('App').controller('Contacts:Reject', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $http.delete('/api/contacts/' + $routeParams.id).

      success(function() {
        $location.path('/contacts');
        $session.flash('success', 'Solicitud Rechazada!');
      }).

      error(function() {
        $location.path('/contacts');
        $session.flash('danger', 'Hubo un error!');
      });
    }

  ]);

}(angular));
