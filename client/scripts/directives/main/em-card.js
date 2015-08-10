/**
* Main Sidebar Directive.
*
* @type AngularJS Directive.
*/

(function (ng) {
  'use strict';

  ng.module('App').directive('emCard', [

    function () {

      return {
        scope: {
          card: '='
        },
        restrict: 'E',
        templateUrl: '/assets/templates/main/em-card.html',
        link: function ($scope, $element, $attrs) {
          var config = {
            "entry": {
              icon: "comment",
              color: "lightBlue",
              span: 'Nueva entrada',
              background: 'yellow'
            },
            "group": {
              icon: "group",
              color: "yellow",
              span: "Grupo creado",
              background: "green"
            },
            "task": {
              icon: "more",
              color: "purple",
              span: "Tarea modificada",
              background: "lightBlue"
            },
            "meeting": {
              icon: "event_note",
              color: "green",
              span: "Nueva reunión",
              background: "green"
            }
          };

          $scope.card.icon = config[$scope.card.type].icon;
          $scope.card.color = config[$scope.card.type].color;
          $scope.card.span = config[$scope.card.type].span;
          $scope.card.background = config[$scope.card.type].background;

        }
      }
    }
  ]);

}(angular));
