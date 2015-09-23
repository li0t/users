/**
 * Worked Times D3 Graph.
 *
 * @type AngularJS Directive.
 */

(function(ng) {
  'use strict';

  ng.module('App').directive('workedTimes', [

    '$moment',
    '$http',

    function($moment, $http) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/worked-times.html',
        link: function($scope) {

          var layers, yGroupMax, yStackMax, margin, color, task, n, m;
          var xAxis, svg, layer, rect, width, height, timeout, x, y;

          var stack = d3.layout.stack().values(function(d) { return d.values; });


          $http.get('api/tasks/collaborators/me').success(function(tasks) {
            if (!tasks.length) return;

            task = tasks[Math.round(Math.random() * (tasks.length - 1))]._id;

            $http.get('api/analytics/worked-times/of/' + task).

            success(function(data) {

              n = data.length; // number of layers
              m = data.length && data[0].values.length; // number of samples per layer

              layers = stack(data);

              yGroupMax = d3.max(layers, function(layer) {
                return d3.max(layer.values, function(d) {
                  return d.y;
                });
              });

              yStackMax = d3.max(layers, function(layer) {
                return d3.max(layer.values, function(d) {
                  return d.y0 + d.y;
                });
              });

              margin = {
                bottom: 20,
                right: 10,
                left: 10,
                top: 40
              };

              width = 960 - margin.left - margin.right;
              height = 500 - margin.top - margin.bottom;

              x = d3.scale.
              ordinal().
              domain(d3.range(m)).
              rangeRoundBands([0, width], 0.08);

              y = d3.scale.
              linear().
              domain([0, yStackMax]).
              range([height, 0]);

              color = d3.scale.
              linear().domain([0, n - 1]).
              range(["#aad", "#556"]);

              xAxis = d3.svg.axis().
              scale(x).
              tickSize(0).
              tickPadding(6).
              orient("bottom");

              svg = d3.select(".times").
              append("svg").
              attr("width", width + margin.left + margin.right).
              attr("height", height + margin.top + margin.bottom).
              append("g").
              attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              layer = svg.selectAll(".layer").
              data(layers).
              enter().append("g").
              attr("class", "layer").
              style("fill", function(d, i) {
                return color(i);
              });

              rect = layer.selectAll("rect").
              data(function(d) {
                return d;
              }).
              enter().append("rect").
              attr("x", function(d) {
                return x(d.x);
              }).
              attr("y", height).
              attr("width", x.rangeBand()).
              attr("height", 0);

              rect.transition().
              delay(function(d, i) {
                return i * 10;
              }).
              attr("y", function(d) {
                return y(d.y0 + d.y);
              }).
              attr("height", function(d) {
                return y(d.y0) - y(d.y0 + d.y);
              });

              svg.append("g").
              attr("class", "x axis").
              attr("transform", "translate(0," + height + ")").
              call(xAxis);

              d3.selectAll("input").on("change", change);

              function change() {
                /*jshint validthis:true */

                if (this.value === "grouped")
                  transitionGrouped();
                else
                  transitionStacked();

              }

              function transitionGrouped() {
                y.domain([0, yGroupMax]);

                rect.transition().
                duration(500).
                delay(function(d, i) {
                  return i * 10;
                }).
                attr("x", function(d, i, j) {
                  return x(d.x) + x.rangeBand() / n * j;
                }).
                attr("width", x.rangeBand() / n).transition().
                attr("y", function(d) {
                  return y(d.y);
                }).
                attr("height", function(d) {
                  return height - y(d.y);
                });
              }

              function transitionStacked() {
                y.domain([0, yStackMax]);

                rect.transition().
                duration(500).
                delay(function(d, i) {
                  return i * 10;
                }).
                attr("y", function(d) {
                  return y(d.y0 + d.y);
                }).
                attr("height", function(d) {
                  return y(d.y0) - y(d.y0 + d.y);
                }).
                transition().
                attr("x", function(d) {
                  return x(d.x);
                }).
                attr("width", x.rangeBand());
              }
            });
          });
        }
      };
    }
  ]);

}(angular));
