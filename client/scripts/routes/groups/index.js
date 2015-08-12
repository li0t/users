(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/groups', {
        controller: 'Groups:Index',
        templateUrl: '/assets/templates/groups/index.html'
      }).

      when('/groups/create', {
        controller: 'Groups:Create',
        templateUrl: '/assets/templates/groups/create.html',
        resolve: {
          posibleMembers: [
            '$http',

            function ($http) {
              return $http.get('/api/contacts');
            }
          ]
        }
      }).

      when('/groups/:id/profile', {
        controller: 'Groups:Profile',
        templateUrl: '/assets/templates/groups/profile.html',
      });

    }

  ]);

}(angular));
