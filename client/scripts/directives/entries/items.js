/**
 * Entries Items Directive.
 *
 * This directive provides the template for the items displayed in entries views.
 *
 * @type AngularJS Directive.
 */
(function (ng) {
  'use strict';

  ng.module('App').directive('entriesItems', [

    function () {

      return {
        restrict : 'E',
        templateUrl: '/assets/templates/entries/items.html'
      };
    }

  ]);

}(angular));
