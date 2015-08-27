/**
 * Groups Items Directive.
 *
 * @type AngularJS Directive.
 */

(function (ng) {
  'use strict';

  ng.module('App').directive('groupItems', [

    function () {

      return {
        restrict : 'E',
        templateUrl: '/assets/templates/groups/items.html',
        link: function ($scope) {

        }
      };
    }

  ]);

}(angular));
