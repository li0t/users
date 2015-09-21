/**

 * Main Creator Directive.
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
