/**
* Main Sidebar Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('mdColresize', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        scope.$evalAsync(function () {
          $timeout(function(){ $(element).colResizable({
            liveDrag: true,
            fixed: true

          });},100);
        });
      }
    }
  })

  .filter('startFrom', function (){
    return function (input,start) {
      start = +start;
      return input.slice(start);
    }
  });

}(angular));
