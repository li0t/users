(function(ng) {
  'use strict';

  ng.module('App').controller('Pages:Home', [
    '$scope', '$http', '$location', '$session', '$timeout', '$emCard',

    function($scope, $http, $location, $session, $timeout, $emCard) {
      $scope.fetching = false;
      $scope.entries = [];

      $scope.pendings = [{
        'title': 'Terminar presentación',
        'description': 'Blah blah'
      }, {
        'title': 'Llamar proveedores',
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

                $http.get('/api/meetings').

                success(function(data) {

                  $scope.entries = $scope.entries.concat(data);

                  $http.get('/api/meetings/attendants/me').

                  success(function(data) {
                    $scope.entries = $scope.entries.concat(data);
                  }).

                  finally(function() {
                    $scope.entries = shuffle($scope.entries);
                    $scope.fetching = false;
                  });
                });
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
