(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups/:id/entries/:type', {
        controller: 'Groups:Entries',
        templateUrl: '/assets/templates/groups/entries/index.html',
      }).

      when('/groups/:id/entries/:type/:id', {
        controller: 'Groups:Entries:Detail',
        templateUrl: '/assets/templates/groups/entries/detail.html',
      }).

      when('/groups/:id/entries/create/document', {
        controller: 'Groups:Entries:Documents',
        templateUrl: '/assets/templates/groups/entries/create/document.html',
      }).

      when('/groups/:id/entries/create/note', {
        controller: 'Groups:Entries:Notes',
        templateUrl: '/assets/templates/groups/entries/create/note.html',
      }).

      when('/groups/:id/entries/create/image', {
        controller: 'Groups:Entries:Images',
        templateUrl: '/assets/templates/groups/entries/create/image.html',
      });

    }

  ]);

}(angular));
