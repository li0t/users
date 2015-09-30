/**
 * Main Creator Directive.
 *
 * This directive provides the template for the main creator button.
 *
 * @type AngularJS Directive.
 */
(function (ng) {
  'use strict';

  ng.module('App').directive('creator', [

    function () {

      return {
        restrict : 'E',
        templateUrl: '/assets/templates/main/creator.html'
      };
    }

  ]);

}(angular));
