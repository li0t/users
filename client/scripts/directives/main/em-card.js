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
          // Card actions variables
          $scope.hasTimer = false;

          var config = { /**  TODO: Member card **/
            "note": {
              icon: "edit",
              color: "#f34235",
              span: 'Nueva Nota',
              background: 'yellow',
              href: ($scope.card._id && '/entries/' + $scope.card._id + '/detail') || '/entries/create/note',
              footer: $scope.card.user && $scope.card.user.email + ' ha creado una nota.'
            },
            "document": {
              icon: "insert_drive_file",
              color: "#ffc006",
              span: 'Nuevo Documento',
              background: 'yellow',
              href:  ($scope.card._id &&  '/entries/' + $scope.card._id + '/detail') || '/entries/create/document',
              footer: $scope.card.user && $scope.card.user.email + ' ha agregado un documento.'
            },
            "image": {
              icon: "image",
              color: "#3e50b4",
              span: 'Nueva Imagen',
              background: 'yellow',
              href:  ($scope.card._id &&  '/entries/' + $scope.card._id + '/detail') || '/entries/create/image',
              footer: $scope.card.user && $scope.card.user.email + ' ha subido una imagen.'
            },
            "audio": {
              icon: "mic",
              color: "#00bbd3",
              span: 'Nuevo Audio',
              background: 'yellow',
              href:  ($scope.card._id &&  '/entries/' + $scope.card._id + '/detail') || '/entries/create/audio',
              footer: $scope.card.user && $scope.card.user.email + ' ha subido un audio.'
            },
            "group": {
              icon: "group",
              color: "#02A8F3",
              span: "Grupo creado",
              background: "green",
              href: '/groups/' + $scope.card._id + '/profile',
              footer: $scope.card.admin && $scope.card.admin.email + ' ha creado el grupo.'
            },
            "task": {
              icon: "more",
              color: "#9b26af",
              span: "Tarea modificada",
              background: "lightBlue",
              href: '/tasks/' + $scope.card._id + '/detail',
              footer: $scope.card.creator && $scope.card.creator.email + ' ha creado una tarea.'
            },
            "meeting": {
              icon: "event_note",
              color: "#8ac248",
              span: "Nueva reunión",
              background: "green",
              href: '/meetings/' + $scope.card._id + '/detail',
              footer: $scope.card.creator && $scope.card.creator.email + ' ha agendado una reunión.'
            }
          };

          // Cards basic configuration, will be override when needed
          $scope.card.background = config[$scope.card.type].background;
          $scope.card.footer = config[$scope.card.type].footer;
          $scope.card.color = config[$scope.card.type].color;
          $scope.card.icon = config[$scope.card.type].icon;
          $scope.card.span = config[$scope.card.type].span;
          $scope.card.href = config[$scope.card.type].href;
          $scope.card.relevantDate = $scope.card.created;


          // Specific configuration for each card
          switch ($scope.card.type) {

            case 'task':
              // Card is Task
              $scope.card.relevantDate = $scope.card.dateTime;
              $scope.card.span = $scope.card.objective;

              break;

            case 'meeting':
              // Card is Meeting
              $scope.card.relevantDate = $scope.card.dateTime;
              $scope.card.span = $scope.card.objective;
              $scope.hasTimer = true;
              break;
          }

          $scope.card.action = $scope.card._id && function() {
            $emCard.setCard($scope.card);
            $emCard.showDetailsBar(true);
          };

        }
      };
    }
  ]);

}(angular));
