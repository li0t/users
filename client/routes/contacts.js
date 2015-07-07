(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/contacts', {
        controller: 'Contacts:Index',
        templateUrl: '/templates/contacts/index.html'
      }).

      when('/contacts/add/:id', {
        controller: 'Contacts:Add',
        templateUrl: '/templates/contacts/index.html'
      }).

      when('/contacts/delete/:id', {
        controller: 'Contacts:Delete',
        templateUrl: '/templates/contacts/index.html'
      }).

      when('/contacts/confirm/:token', {
        controller: 'Contacts:Confirm',
        templateUrl: '/templates/contacts/index.html'
      }).

      when('/contacts/reject/:id', {
        controller: 'Contacts:Reject',
        templateUrl: '/templates/contacts/index.html'
      });

    }

  ]);

}(angular));
