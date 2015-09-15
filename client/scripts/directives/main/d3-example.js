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

          var color, pack, svg;

          var diameter = 960;
          var margin = 20;

          color = d3.scale.
          linear().
          domain([-1, 5]).
          range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"]).
          interpolate(d3.interpolateHcl);

          pack = d3.layout.pack().
          padding(2).
          size([diameter - margin, diameter - margin]).
          value(function(d) {
            return d.size;
          });

          svg = d3.select(".content").
          append("svg").
          attr("width", diameter).
          attr("height", diameter).
          append("g").
          attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

          d3.json("/api/analytics/groups", function(error, root) {
            if (error) throw error;
console.log(root);
            var circle, text, node, transition, view;

            var focus = root;
            var nodes = pack.nodes(root);
console.log(nodes);

          });

          d3.select(self.frameElement).style("height", diameter + "px");
        }
      };
    }

  ]);

}(angular));
