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
              icon: "edit",
              color: "#f34235",
              span: 'Nueva Nota',
              background: 'yellow'
            },
            "document": {
              icon: "insert_drive_file",
              color: "#ffc006",
              span: 'Nuevo Documento',
              background: 'yellow'
            },
            "image": {
              icon: "image",
              color: "#3e50b4",
              span: 'Nueva Imagen',
              background: 'yellow'
            },
            "audio": {
              icon: "mic",
              color: "#00bbd3",
              span: 'Nuevo Audio',
              background: 'yellow'
            },
            "group": {
              icon: "group",
              color: "#02A8F3",
              span: "Grupo creado",
              background: "green"
            },
            "task": {
              icon: "more",
              color: "#9b26af",
              span: "Tarea modificada",
              background: "lightBlue"
            },
            "meeting": {
              icon: "event_note",
              color: "#8ac248",
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
