(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups', {
        controller: 'Groups:Index',
        templateUrl: '/assets/templates/groups/index.html'
      }).

      when('/groups/create', {
        controller: 'Groups:Create',
        templateUrl: '/assets/templates/groups/create.html'
      }).

      when('/groups/:id/profile', {
        controller: 'Groups:Profile',
        templateUrl: '/assets/templates/groups/profile.html'
      }).

      when('/groups/:id/tasks', {
        controller: 'Groups:Tasks',
        templateUrl: '/assets/templates/groups/tasks.html'
      }).

      when('/groups/:id/meetings', {
        controller: 'Groups:Meetings',
        templateUrl: '/assets/templates/groups/meetings.html'
      }).

      when('/groups/:id/entries/:type', {
        controller: 'Groups:Entries',
        templateUrl: '/assets/templates/groups/entries.html'
      });

    }

  ]);

}(angular));
