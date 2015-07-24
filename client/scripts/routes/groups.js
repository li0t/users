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
        templateUrl: '/assets/templates/groups/create.html',
        resolve: {
          posibleMembers: [
            '$http',

            function ($http) {
              return $http.get('/api/contacts');
            }
          ]
        }
      }).

      when('/groups/:id/tasks', {
        controller: 'Groups:Tasks',
        templateUrl: '/assets/templates/groups/tasks/index.html'
      }).

      when('/groups/:id/tasks/create', {
        controller: 'Groups:Tasks:Create',
        templateUrl: '/assets/templates/groups/tasks/create.html',
        resolve: {
          priorities: [
            '$statics',

            function ($statics) {
              return $statics.get('priorities');
            }
          ]
        }
      }).

      when('/groups/:id/tasks/:task/detail', {
        controller: 'Groups:Tasks:Detail',
        templateUrl: '/assets/templates/groups/tasks/detail.html'
      }).

      when('/groups/:id/members', {
        controller: 'Groups:Members',
        templateUrl: '/assets/templates/groups/members/index.html'
      }).

      when('/groups/:id/members/add', {
        controller: 'Groups:Members:Add',
        templateUrl: '/assets/templates/groups/members/add.html'
      }).

      when('/groups/:id/profile', {
        controller: 'Groups:Profile',
        templateUrl: '/assets/templates/groups/profile.html',
      }).

      when('/groups/:id/entries', {
        controller: 'Groups:Entries',
        templateUrl: '/assets/templates/groups/entries/index.html',
      }).

      when('/groups/:id/entries/create', {
        controller: 'Groups:Entries:Create',
        templateUrl: '/assets/templates/groups/entries/create.html',
      }).

      when('/groups/:id/entries/:entry/detail', {
        controller: 'Groups:Entries:Detail',
        templateUrl: '/assets/templates/groups/entries/detail.html',
      });
    }

  ]);

}(angular));
