/**
 * Main Sidebar Directive.
 *
 * @type AngularJS Directive.
 */

(function (ng) {
  'use strict';

  ng.module('App').directive('emCard', [

    function () {

      return {
        restrict: 'A',
        templateUrl: '/assets/templates/main/emcard.html',
        link: function ($scope, $element, $attrs) {

        }
      };
    }

  ]);

}(angular));
