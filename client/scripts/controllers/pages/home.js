(function(ng) {
  'use strict';

  ng.module('App').controller('Pages:Home', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      $scope.fetching = false;
      $scope.entries = [];

      var meetings = [{
        'title': 'Reunión inicial',
        'author': 'Egbert Dool'
      }, {
        'title': 'Junta de amigos',
        'author': 'Champion amigo'
      }];

      var backgrounds = {
        "entry": "yellow",
        "group": "blue",
        "task": "purple",
        "meeting": "red"
      };

      var icons = {
        "entry": "comment",
        "group": "group",
        "task": "more",
        "meeting": "event_note"
      };

      var spans = {
        "entry": "Nueva entrada",
        "group": "Grupo",
        "task": "Tarea",
        "meeting": "Reunión"
      };

      /* Based on Fisher–Yates */
      function shuffle (a) {
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

      function loadEntries() {
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
      }

      return ($session.get('user')) && loadEntries();

    }
  ]);

}(angular));
