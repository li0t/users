/**
 * Main Sidebar Directive.
 *
 * @type AngularJS Directive.
 */

(function (ng) {
  'use strict';

  ng.module('App').directive('mainToolbar', [

    function () {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/main-toolbar.html',
        link: function ($scope, $element, $attrs) {

        }
      };
    }

  ]);

}(angular));
