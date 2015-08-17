(function(ng) {
  'use strict';

  ng.module('App').controller('Pages:Home', [
    '$scope', '$http', '$location', '$session', '$timeout',

    function($scope, $http, $location, $session, $timeout) {
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
        'created': '2015-07-10 17:28:33.208Z',
        'type': 'audio'
      }, {
        'title': 'Junta de amigos',
        'author': 'Champion amigo',
        'created': '2015-03-22 17:28:33.208Z',
        'type': 'document'
      }, {
        'title': 'Partido de Futbol',
        'author': 'Don Pedro',
        'created': '2015-05-22 17:28:33.208Z',
        'type': 'note'
      }, {
        'title': 'Presentación Servicios',
        'author': 'Amateru Caupolican',
        'created': '2015-07-12 17:28:33.208Z',
        'type': 'image'
      }, {
        'title': 'Estado financiero',
        'author': 'Lucas Cofre',
        'created': '2015-09-22 17:28:33.208Z',
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

        $scope.fetching = true;

        $http.get('/api/entries').

        success(function(data) {

          $scope.entries = $scope.entries.concat(data);

          $http.get('/api/groups').

          success(function(data) {

            $scope.entries = $scope.entries.concat(data);

            $http.get('/api/tasks').

            success(function(data) {

              $scope.entries = $scope.entries.concat(data);

              $http.get('/api/tasks/collaborators/me').

              success(function(data) {

                $scope.entries = $scope.entries.concat(data);
                $scope.entries = $scope.entries.concat(meetings);

              }).

              finally(function() {
                $scope.fetching = false;
                $scope.entries = shuffle($scope.entries);
              });
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
