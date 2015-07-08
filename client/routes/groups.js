(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups', {
        controller: 'Groups:Index',
        templateUrl: '/templates/groups/index.html'
      }).

      when('/groups/create', {
        controller: 'Groups:Create',
        templateUrl: '/templates/groups/create.html',
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
        templateUrl: '/templates/groups/tasks/index.html'
      }).

      when('/groups/:id/tasks/:task/detail', {
        controller: 'Groups:Tasks:Detail',
        templateUrl: '/templates/groups/tasks/detail.html'
      }).

      when('/groups/:id/members', {
        controller: 'Groups:Members',
        templateUrl: '/templates/groups/members/index.html'
      }).

      when('/groups/:id/members/add/:user', {
        controller: 'Groups:Members:Add',
        templateUrl: '/templates/groups/members/add.html'
      }).

      when('/groups/:id/members/remove/:user', {
        controller: 'Groups:Members:Remove',
        templateUrl: '/templates/groups/members/remove.html'
      }).

      when('/groups/:id/profile', {
        controller: 'Groups:Profile',
        templateUrl: '/templates/groups/profile.html',
      }).

      when('/groups/:id/entries/:entry/detail', {
        controller: 'Groups:Entries',
        templateUrl: '/templates/groups/entries/detail.html',
      });
    }

  ]);

}(angular));
