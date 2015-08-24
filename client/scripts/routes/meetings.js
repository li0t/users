(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/meetings/attendant', {
        controller: 'Meetings:Attendant',
        templateUrl: '/assets/templates/meetings/attendant.html'
      }).

      when('/meetings/creator', {
        controller: 'Meetings:Creator',
        templateUrl: '/assets/templates/meetings/creator.html'
      }).

      when('/meetings/create', {
        controller: 'Meetings:Create',
        templateUrl: '/assets/templates/meetings/create.html'
      }).

      when('/meetings/:id/detail', {
        controller: 'Meetings:Detail',
        templateUrl: '/assets/templates/meetings/detail.html'
      });

    }

  ]);

}(angular));
