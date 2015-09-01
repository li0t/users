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
          // Type to int helper for switch
          function typeToInt(type) {
            if (type === 'note') {
              return 0;
            } else if (type === 'document') {
              return 1;
            } else if (type === 'image') {
              return 2;
            } else if (type === 'audio') {
              return 3;
            } else if (type === 'group') {
              return 4;
            } else if (type === 'task') {
              return 5;
            } else if (type === 'meeting') {
              return 6;
            }
          }

          // Cards basic configuration, will be override when needed
          $scope.card.icon = config[$scope.card.type].icon;
          $scope.card.color = config[$scope.card.type].color;
          $scope.card.span = config[$scope.card.type].span;
          $scope.card.background = config[$scope.card.type].background;
          $scope.card.relevantDate = $scope.card.created;

          // Specific configuration for each card
          switch (typeToInt($scope.card.type)) {

            case 5:
            // Card is Task
            if ($scope.card.isCollaborator) {

              $scope.card.isWorking = !!$scope.card.isWorking;
              $scope.hasTimer = !$scope.card.completed;

              $scope.toogleWorking = function(task) {

                $http.put('/api/tasks/' + task + '/worked-time').

                error(function() {
                  console.log('Hubo un error con la tarea');
                });

              };
            }

            $scope.card.span = $scope.card.objective;
            $scope.card.relevantDate = $scope.card.dateTime;

            break;

            case 6:
            // Card is Meeting
            $scope.hasTimer = true;
            $scope.card.span = $scope.card.title;
            break;
          }
          
          $scope.card.action = function() {
            $emCard.setCard($scope.card);
            $emCard.showDetailsBar(true);
          };

        }
      };
    }
  ]);

}(angular));
