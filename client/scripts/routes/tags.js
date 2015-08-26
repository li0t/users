(function(ng) {
  'use strict';

  ng.module('App').config([
    '$routeProvider',

    function($routeProvider) {

      $routeProvider.

      when('/tags/create', {
        controller: 'Tags:Create',
        templateUrl: '/assets/templates/tags/create.html'
      });

    }

  ]);

}(angular));
