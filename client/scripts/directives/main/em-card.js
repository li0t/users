/**
 * emCard Directive.
 *
 * @type AngularJS Directive.
 */

(function(ng) {
  'use strict';

  ng.module('App').directive('emCard', [

    '$http', '$mdSidenav', '$emCard',

    function($http, $mdSidenav, $emCard) {

      return {
        scope: {
          card: '='
        },

        restrict: 'E',

        templateUrl: '/assets/templates/main/em-card.html',

        link: function($scope, $element, $attrs) {

          switch ($scope.card.type) {

            case 'task':
              $scope.card = $emCard.tasks.elementToCard($scope.card);
              break;

            case 'meeting':
              $scope.card = $emCard.meetings.elementToCard($scope.card);
              break;

            case 'group':
              $scope.card = $emCard.groups.elementToCard($scope.card);
              break

            default:
              $scope.card = $emCard.entries.elementToCard($scope.card);
              break


          }

          // emCard Action
          $scope.card.action = $scope.card._id && function() {
            $emCard.setCard($scope.card);
            $emCard.showDetailsBar(true);
          };

          $scope.showDetails = $scope.card._id && function() {
            $emCard.showDetailsBar(false);
          };

        }
      };
    }
  ]);

}(angular));
