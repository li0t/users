(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/contacts', {
        controller: 'Contacts:Index',
        templateUrl: '/templates/contacts/index.html'
      });
      
    }

  ]);

}(angular));
