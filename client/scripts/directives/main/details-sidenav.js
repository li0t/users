/**
* Details Sidebar Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('detailsSidenav', [
    '$emCard', '$interval', '$routeParams',

    function ($emCard, $interval, $routeParams) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/details-sidenav.html',
        link: function ($scope, $element, $attrs) {

          $scope.$watch( function () { return $emCard.activeCard }, function (data) {
            $routeParams.id = data._id;
            $scope.activeCard = data;
          }, true);

          $scope.close = function () {
            $emCard.showDetailsBar(false);
          }

        }
      };
    }

  ]);

}(angular));
