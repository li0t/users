(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups/:id/meetings', {
        controller: 'Groups:Meetings',
        templateUrl: '/assets/templates/groups/meetings/index.html'
      }).

      when('/groups/:id/meetings/create', {
        controller: 'Groups:Meetings:Create',
        templateUrl: '/assets/templates/groups/meetings/create.html'
      }).

      when('/groups/:id/meetings/:meeting/detail', {
        controller: 'Groups:Meetings:Detail',
        templateUrl: '/assets/templates/groups/meetings/detail.html'
      }).

      when('/groups/:id/meetings/:meeting/attendants', {
        controller: 'Groups:Meetings:Attendants',
        templateUrl: '/assets/templates/groups/meetings/attendants/index.html'
      }).

      when('/groups/:id/meetings/:meeting/attendants/add', {
        controller: 'Groups:Meetings:Attendants:Add',
        templateUrl: '/assets/templates/groups/meetings/attendants/add.html'
      });

    }

  ]);

}(angular));
