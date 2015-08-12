(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups/:id/members', {
        controller: 'Groups:Members',
        templateUrl: '/assets/templates/groups/members/index.html'
      }).

      when('/groups/:id/members/add', {
        controller: 'Groups:Members:Add',
        templateUrl: '/assets/templates/groups/members/add.html'
      });


    }

  ]);

}(angular));
