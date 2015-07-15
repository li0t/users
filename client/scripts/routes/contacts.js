(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/contacts', {
        controller: 'Contacts:Index',
        templateUrl: '/assets/templates/contacts/index.html'
      }).

      when('/contacts/add/:id', {
        controller: 'Contacts:Add',
        templateUrl: '/assets/templates/contacts/index.html'
      }).

      when('/contacts/delete/:id', {
        controller: 'Contacts:Delete',
        templateUrl: '/assets/templates/contacts/index.html'
      }).

      when('/contacts/confirm/:token', {
        controller: 'Contacts:Confirm',
        templateUrl: '/assets/templates/contacts/index.html'
      }).

      when('/contacts/reject/:id', {
        controller: 'Contacts:Reject',
        templateUrl: '/assets/templates/contacts/index.html'
      });

    }

  ]);

}(angular));
