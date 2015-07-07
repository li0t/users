(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/entries', {
        controller: 'Entries:Index',
        templateUrl: '/templates/entries/index.html'
      }).

      when('/entries/create', {
        controller: 'Entries:Create',
        templateUrl: '/templates/entries/create.html'
      }).

      when('/entries/:id/detail', {
        controller: 'Entries:Detail',
        templateUrl: '/templates/entries/detail.html'
      });
    }

  ]);

}(angular));
