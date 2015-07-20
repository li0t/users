(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/meetings', {
        controller: 'Meetings:Index',
        templateUrl: '/assets/templates/meetings/index.html'
      });
    }

  ]);

}(angular));
