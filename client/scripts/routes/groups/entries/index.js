(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups/:id/entries', {
        controller: 'Groups:Entries',
        templateUrl: '/assets/templates/groups/entries/index.html',
      }).

      when('/groups/:id/entries/:entry/detail', {
        controller: 'Groups:Entries',
        templateUrl: '/assets/templates/groups/entries/detail.html',
      });

    }

  ]);

}(angular));
