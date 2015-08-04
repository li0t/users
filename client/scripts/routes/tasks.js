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

      when('/tasks/own', {
        controller: 'Tasks:Own',
        templateUrl: '/assets/templates/tasks/own.html'
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
      });

    }

  ]);

}(angular));
