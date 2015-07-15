(function(ng) {
  'use strict';

  ng.module('App').controller('Contacts:Confirm', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $http.put('/api/contacts/confirm/' + $routeParams.token).

      success(function() {
        $location.path('/contacts');
        $session.flash('success', 'Ahora tienes un nuevo contacto!');
      }).

      error(function(data) {
        $location.path('/contacts');
        $session.flash('danger', 'Hubo un error!');
      });
    }

  ]);

}(angular));
