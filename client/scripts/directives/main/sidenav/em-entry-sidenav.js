/**
* Tasks Main Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('emEntrySidenav', [
    '$emCard', '$http', '$session', '$moment',

    function ($emCard, $http, $session, $moment) {

      return {
        restrict: 'E',

        templateUrl: '/assets/templates/entries/sidenav.html',

        link: function ($scope, $element, $attrs) {

          // Explicit sync between activeCard and $emCard service
          $scope.activeCard = $emCard.activeCard;

          $scope.fetching = null;
          $scope.entry = null;
          $scope.group = null;

          $scope.fetch = function() {

            $scope.fetching = true;

            $http.get('/api/entries/' + $scope.activeCard._id).

            success(function(data) {
              $scope.entry = data;
              $scope.group = data.group._id;
            }).

            finally(function(){
              $scope.fetching = false;

            });
          };

          $scope.fetch();
        }

      };

    }

  ]);

}(angular));
