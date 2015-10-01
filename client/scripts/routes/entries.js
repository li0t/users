(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/entries/create', {
        controller: 'Entries:Create',
        templateUrl: '/assets/templates/entries/create/index.html'
      }).

      when('/entries/:id/detail', {
        controller: 'Entries:Detail',
        templateUrl: '/assets/templates/entries/detail.html'
      }).

      when('/entries/create/document', {
        controller: 'Entries:Create:Documents',
        templateUrl: '/assets/templates/entries/create/document.html'
      }).

      when('/entries/create/note', {
        controller: 'Entries:Create:Notes',
        templateUrl: '/assets/templates/entries/create/note.html'
      }).

      when('/entries/create/image', {
        controller: 'Entries:Create:Images',
        templateUrl: '/assets/templates/entries/create/image.html'
      }).

      when('/entries/create/audio', {
        controller: 'Entries:Create:Audios',
        templateUrl: '/assets/templates/entries/create/audio.html'
      });
    }

  ]);

}(angular));
