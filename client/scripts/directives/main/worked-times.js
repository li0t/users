/**
 * Worked Times D3 Graph.
 *
 * @type AngularJS Directive.
 */

(function(ng) {
  'use strict';

  ng.module('App').directive('workedTimes', [

    '$http',

    function($http) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/worked-times.html',
        link: function($scope) {

        }
      };
    }
  ]);

}(angular));
