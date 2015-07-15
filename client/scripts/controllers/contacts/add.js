(function(ng) {
  'use strict';

  ng.module('App').controller('Contacts:Add', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $http.post('/api/contacts', { id: $routeParams.id }).

      success(function(user) {

        $http.post('/api/mandrill/addContact', { id: user }).

        success(function() {
          $location.path('/contacts');
          $session.flash('success', 'Has enviado una solicitud de contacto!');
        }).

        error(function(data) {
          $location.path('/contacts');
          $session.flash('danger', data);
        });

      }).
      error(function(data) {
        $location.path('/contacts');
        $session.flash('danger', data);
      });
    }

  ]);

}(angular));
