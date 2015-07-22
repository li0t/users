(function(ng) {
  'use strict';

  ng.module('App').controller('Pages:Home', [
    '$scope', '$http', '$location', '$session', '$timeout',

    function($scope, $http, $location, $session, $timeout) {
      $scope.fetching = false;
      $scope.entries = [];

      $scope.pendings = [{
        'title': 'Tarea 1',
        'description': 'Blah blah'
      }, {
        'title': 'Tarea 2',
        'description': 'Blah blah blah'
      }, {
        'title': 'Reunión',
        'description': 'Juntarse con ...'
      }, {
        'title': 'Reunión de amigos',
        'description': 'Confirmar que J...'
      }, {
        'title': 'Tarea 3',
        'description': 'Blah blah vlad...'
      }];

      var meetings = [{
        'title': 'Reunión inicial',
        'author': 'Egbert Dool'
      }, {
        'title': 'Junta de amigos',
        'author': 'Champion amigo'
      }];

      var backgrounds = {
        "entry": "yellow",
        "group": "green",
        "task": "lightBlue",
        "meeting": "blue"
      };

      var icons = {
        "entry": {
          "icon": "comment",
          "color": "lightBlue"
        },
        "group": {
          "icon": "group",
          "color": "white"
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
        "group": "Grupo",
        "task": "Tarea",
        "meeting": "Reunión"
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

                if (i === 1) {
                  break;
                }
              }


            }).

            finally(function() {
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
