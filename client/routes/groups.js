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

      when('/groups/:id/members/add/:user', {
        controller: 'Groups:AddMember',
        templateUrl: '/templates/groups/members/add.html'
      }).

      when('/groups/:id/members/remove/:user', {
        controller: 'Groups:RemoveMember',
        templateUrl: '/templates/groups/members/remove.html'
      }).

      when('/groups/:id', {
        controller: 'Groups:Details',
        templateUrl: '/templates/groups/details.html',
      });
    }

  ]);

}(angular));
