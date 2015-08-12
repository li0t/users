(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups/:id/entries/documents', {
        controller: 'Groups:Entries:Documents',
        templateUrl: '/assets/templates/groups/entries/index/documents.html',
      }).

      when('/groups/:id/entries/documents/create', {
        controller: 'Groups:Entries:Documents:Create',
        templateUrl: '/assets/templates/groups/entries/documents/create.html',
      }).

      when('/groups/:id/entries/notes/:id/detail', {
        controller: 'Groups:Entries:Documents:Detail',
        templateUrl: '/assets/templates/groups/entries/documents/detail.html',
      });


    }

  ]);

}(angular));
