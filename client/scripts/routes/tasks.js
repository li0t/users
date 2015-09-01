(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/tasks/collaborator', {
        controller: 'Tasks:Collaborator',
        templateUrl: '/assets/templates/tasks/collaborator.html'
      }).

      when('/tasks/creator', {
        controller: 'Tasks:Creator',
        templateUrl: '/assets/templates/tasks/creator.html'
      }).

      when('/tasks/create', {
        controller: 'Tasks:Create',
        templateUrl: '/assets/templates/tasks/create.html',
        resolve: {
          priorities: [
            '$statics',

            function ($statics) {
              return $statics.get('priorities');
            }
          ]
        }
      }).

      when('/tasks/:id/detail', {
        controller: 'Tasks:Detail',
        templateUrl: '/assets/templates/tasks/detail.html'
      }).

      when('/tasks/:id/collaborators', {
        controller: 'Tasks:Collaborators',
        templateUrl: '/assets/templates/tasks/collaborators/index.html'
      }).

      when('/tasks/:id/collaborators/add', {
        controller: 'Tasks:Collaborators:Add',
        templateUrl: '/assets/templates/tasks/collaborators/add.html'
      });

    }

  ]);

}(angular));
