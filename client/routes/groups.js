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
        templateUrl: '/templates/groups/create.html'
      }).

      when('/groups/:id/members', {
        controller: 'Groups:Members:Index',
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

      when('/groups/:id/details', {
        controller: 'Groups:Profile',
        templateUrl: '/templates/groups/details.html',
      });
    }

  ]);

}(angular));
