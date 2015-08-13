(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

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

      when('/groups/:id/tasks/:task/collaborators', {
        controller: 'Groups:Tasks:Collaborators',
        templateUrl: '/assets/templates/groups/tasks/collaborators/index.html'
      }).

      when('/groups/:id/tasks/:task/collaborators/add', {
        controller: 'Groups:Tasks:Collaborators:Add',
        templateUrl: '/assets/templates/groups/tasks/collaborators/add.html'
      });

    }

  ]);

}(angular));
