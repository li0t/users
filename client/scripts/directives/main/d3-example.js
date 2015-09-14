/**
 * D3 example.
 *
 * @type AngularJS Directive.
 */

(function(ng) {
  'use strict';

  ng.module('App').directive('d3Example', [

    '$http',

    function($http) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/d3example.html',
        link: function($scope) {
          
          var data = [4, 8, 15, 16, 23, 42];

          var
            scale = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, 420]);

          d3.
          select('.chart').
          selectAll('div').
          data(data).
          enter().
          append('div').
          style('width', function(d) {
            return scale(d) + 'px';
          }).text(function(d) {
            return d;
          });

        }
      };
    }

  ]);

}(angular));
