(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/search', {
        controller: 'Search:Index',
        templateUrl: '/templates/search/index.html'
      });

    }

  ]);

}(angular));
