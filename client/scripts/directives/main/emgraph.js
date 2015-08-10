/**
* Main Sidebar Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('emGraph', [

    function () {

      return {
        restrict: 'A',
        templateUrl: '/assets/templates/main/emgraph.html',
        link: function ($scope, $element, $attrs) {
          // d3 graph generation goes here.

          }

        };
      }

    ]);

  }(angular));
