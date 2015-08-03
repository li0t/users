/**
 * Main Navbar Directive.
 *
 * This directive controlls the main navbar's behaviour by detecting the scroll-top distance and
 * set it to be folded or unfolded. It also sets the current location's path to a scope variable
 * for the navigation links to detect if they're active.
 *
 * @type AngularJS Directive.
 */

(function (ng) {
  'use strict';

  ng.module('App').directive('mainNavbar', [
    '$window', '$location', '$http', '$session',

    function ($window, $location, $http, $session) {

      return {
        restrict: 'A',
        templateUrl: '/assets/templates/main/navbar.html',
        link: function ($scope, $element) {

        }
      };
    }
  ]);

}(angular));
