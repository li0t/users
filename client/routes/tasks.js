(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/tasks', {
        controller: 'Tasks:Index',
        templateUrl: '/templates/tasks/index.html'
      }).

      when('/tasks/create', {
        controller: 'Tasks:Create',
        templateUrl: '/templates/tasks/create.html'
      }).

      when('/tasks/:id/detail', {
        controller: 'Tasks:Detail',
        templateUrl: '/templates/tasks/detail.html'
      });

    }

  ]);

}(angular));
