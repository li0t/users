(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/tasks', {
        controller: 'Task:Index',
        templateUrl: '/templates/tasks/index.html'
      }).

      when('/tasks/create', {
        controller: 'Task:Create',
        templateUrl: '/templates/tasks/create.html'
      }).

      when('/tasks/:id/close', {
        controller: 'Task:Close',
        templateUrl: '/templates/tasks/close.html'
      });

    }

  ]);

}(angular));
