/**
* Main Sidebar Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('mdTable', function () {
    return {
      restrict: 'E',
      scope: {
        headers: '=',
        content: '=',
        sortable: '=',
        filters: '=',
        customClass: '=customClass',
        thumbs:'=',
        count: '='
      },
      controller: function ($scope, $filter, $window) {
        var orderBy = $filter('orderBy');
        $scope.tablePage = 0;
        $scope.nbOfPages = function () {
          return Math.ceil($scope.content.length / $scope.count);
        },
        $scope.handleSort = function (field) {
          if ($scope.sortable.indexOf(field) > -1) { return true; } else { return false; }
        };
        $scope.order = function(predicate, reverse) {
          $scope.content = orderBy($scope.content, predicate, reverse);
          $scope.predicate = predicate;
        };
        $scope.order($scope.sortable[0],false);
        $scope.getNumber = function (num) {
          return new Array(num);
        };
        $scope.goToPage = function (page) {
          $scope.tablePage = page;
        };
      },
      template: angular.element(document.querySelector('#md-table-template')).html()
    }
  });

}(angular));
