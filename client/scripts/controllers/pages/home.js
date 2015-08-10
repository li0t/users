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
        'created' : '2015-07-14 17:28:33.208Z',
        'type': 'meeting'
      },
      {
        'title': 'Junta de amigos',
        'author': 'Champion amigo',
        'created' : '2015-07-22 17:28:33.208Z',
        'type': 'meeting'
      },
      {
        'title': 'Partido de Futbol',
        'author': 'Don Pedro',
        'created' : '2015-07-22 17:28:33.208Z',
        'type': 'meeting'
      },
      {
        'title': 'Presentación Servicios',
        'author': 'Amateru Caupolican',
        'created' : '2015-07-22 17:28:33.208Z',
        'type': 'meeting'
      },
      {
        'title': 'Estado financiero',
        'author': 'Lucas Cofre',
        'created' : '2015-07-22 17:28:33.208Z',
        'type': 'meeting'
      }];


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
            $scope.entries.push(entry);
          }

          $http.get('/api/groups').

          success(function(data) {
            for (i = 0; i < data.length; i++) {
              entry = data[i];
              $scope.entries.push(entry);
            }

            $http.get('/api/tasks').

            success(function(data) {
              for (i = 0; i < data.length; i++) {
                entry = data[i];
                $scope.entries.push(entry);
              }

              /** MOCK DATA */
              for (i = 0; i < meetings.length; i++) {
                entry = meetings[i];
                $scope.entries.push(entry);
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
