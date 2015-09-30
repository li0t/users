/**
 * Groups Items Directive.
 *
 * This directive provides the template for the items displayed in groups views.
 *
 * @type AngularJS Directive.
 */
(function (ng) {
  'use strict';

  ng.module('App').directive('groupItems', [

    function () {

      return {
        restrict : 'E',
        templateUrl: '/assets/templates/groups/items.html'
      };
    }

  ]);

}(angular));
