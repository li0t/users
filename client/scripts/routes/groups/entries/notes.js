(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups/:id/entries/notes', {
        controller: 'Groups:Entries:Notes',
        templateUrl: '/assets/templates/groups/entries/notes/index.html',
      }).

      when('/groups/:id/entries/notes/create', {
        controller: 'Groups:Entries:Notes:Create',
        templateUrl: '/assets/templates/groups/entries/notes/create.html',
      }).

      when('/groups/:id/entries/notes/:id/detail', {
        controller: 'Groups:Entries:Notes:Detail',
        templateUrl: '/assets/templates/groups/entries/notes/detail.html',
      });

    }

  ]);

}(angular));
