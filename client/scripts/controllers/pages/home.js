(function(ng) {
  'use strict';

  ng.module('App').controller('Pages:Home', [
    '$scope', '$http', '$location', '$session', '$timeout',

    function($scope, $http, $location, $session, $timeout ) {
      $scope.fetching = false;
      $scope.entries = [];

      $scope.pendings = [{
        'title': 'Terminar presentación',
        'description': 'Blah blah'
      }, {
        'title': 'Llamar proeedores',
        'description': 'Blah blah blah'
      }, {
        'title': 'Prepara reunión de mark',
        'description': 'Juntarse con ...'
      }, {
        'title': 'Reunión de amigos',
        'description': 'Confirmar que J...'
      }, {
        'title': 'Medir perímetro',
        'description': 'Blah blah vlad...'
      }];

      var meetings = [{
        'title': 'Reunión inicial',
        'author': 'Egbert Dool',
        'created' : '2015-07-14 17:28:33.208Z'
      },
      {
        'title': 'Junta de amigos',
        'author': 'Champion amigo',
        'created' : '2015-07-22 17:28:33.208Z'
      },
      {
        'title': 'Partido de Futbol',
        'author': 'Don Pedro',
        'created' : '2015-07-22 17:28:33.208Z'
      },
      {
        'title': 'Presentación Servicios',
        'author': 'Amateru Caupolican',
        'created' : '2015-07-22 17:28:33.208Z'
      },
      {
        'title': 'Estado financiero',
        'author': 'Lucas Cofre',
        'created' : '2015-07-22 17:28:33.208Z'
      }];

      var backgrounds = {
        "entry": "yellow",
        "group": "green",
        "task": "lightBlue",
        "meeting": "green"
      };

      var icons = {
        "entry": {
          "icon": "comment",
          "color": "lightBlue"
        },
        "group": {
          "icon": "group",
          "color": "yellow"
        },
        "task": {
          "icon": "more",
          "color": "purple"
        },
        "meeting": {
          "icon": "event_note",
          "color": "green"
        }
      };

      var spans = {
        "entry": "Nueva entrada",
        "group": "Grupo creado",
        "task": "Tarea modificada",
        "meeting": "Nueva reunión"
      };

      /* Shuffle an array, Based on Fisher–Yates shuffle algorithm */
      function shuffle(a) {
        var n = a.length;
        var aux;
        var i;

        while (n) {
          i = Math.floor(Math.random() * n--);
          aux = a[n];
          a[n] = a[i];
          a[i] = aux;
        }

        return a;

      }

      $scope.loadEntries = function() {
        var entry;
        var i = 1;

        $scope.fetching = true;

        $http.get('/api/entries').

        success(function(data) {

          for (i = 0; i < data.length; i++) {

            entry = data[i];
            entry.type = "entry";
            entry.icon = icons[entry.type];
            entry.span = spans[entry.type];
            entry.background = backgrounds[entry.type];

            $scope.entries.push(entry);

            if (i === 1) {
              break;
            }
          }

          $http.get('/api/groups').

          success(function(data) {

            for (i = 0; i < data.length; i++) {

              entry = data[i];
              entry.type = "group";
              entry.icon = icons[entry.type];
              entry.span = spans[entry.type];
              entry.background = backgrounds[entry.type];

              $scope.entries.push(entry);

              if (i === 1) {
                break;
              }
            }

            $http.get('/api/tasks').

            success(function(data) {

              for (i = 0; i < data.length; i++) {

                entry = data[i];
                entry.type = "task";
                entry.icon = icons[entry.type];
                entry.span = spans[entry.type];
                entry.background = backgrounds[entry.type];

                $scope.entries.push(entry);

                if (i === 1) {
                  break;
                }
              }

              /** MOCK DATA */
              for (i = 0; i < meetings.length; i++) {

                entry = meetings[i];
                entry.type = "meeting";
                entry.icon = icons[entry.type];
                entry.span = spans[entry.type];
                entry.background = backgrounds[entry.type];

                $scope.entries.push(entry);
              }


            }).

            finally(function() {
              console.log($scope.entries);
              $scope.fetching = false;
              $scope.entries = shuffle($scope.entries);

            });
          });
        });
      };

      $scope.gotIt = function(pending) {
        var index = $scope.pendings.indexOf(pending);

        if (index >= 0) {
          $timeout(function() {
            $scope.pendings.splice(index, 1);
          }, 750);
        }
      };

      return ($session.get('user')) && $scope.loadEntries();

    }
  ]);

}(angular));
