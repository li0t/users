(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.group = $routeParams.id;
      $scope.fetching = null;
      $scope.limit = 10;
      $scope.skip = 0;

      $scope.getHref = function(entry) {

        var href = '';

        switch (entry.type) {

          case 'task':
            href = '/tasks/' + entry.id + '/detail';
            break;

          case 'meeting':
            href = '/meetings/' + entry.id + '/detail';
            break;

          default:
            href = '/entries/' + entry.id + '/detail';
            break;
        }
        return href;
      };

      $scope.fetchGroup = function() {

        $scope.fetching = true;

        $http.post('/api/groups/set/' + $scope.group).

        success(function(data) {

          $session.set('group', data);

          $http.get('/api/entries/of/group/' + $scope.group + '?limit=' + $scope.limit + '&skip=' + $scope.skip).

          success(function(data) {
            $scope.entries = data;

            $http.get('/api/tasks/of/group/' + $scope.group + '?limit=' + $scope.limit + '&skip=' + $scope.skip).

            success(function(data) {
              $scope.entries = $scope.entries.concat(data);

              $http.get('/api/meetings/of/group/' + $scope.group + '?limit=' + $scope.limit + '&skip=' + $scope.skip).

              success(function(data) {
                $scope.entries = $scope.entries.concat(data);
              }).

              error(function() {
                $session.flash('danger', "Hubo un error obteniendo las reuniones del grupo");
              }).
              finally(function() {
                $scope.fetching = false;
              });
            }).
            error(function() {
              $session.flash('danger', "Hubo un error obteniendo las tareas del grupo");
            });
          }).
          error(function() {
            $session.flash('danger', "Hubo un error obteniendo las entradas del grupo");
          });
        }).
        error(function() {
          $session.flash('danger', "Hubo un error la información del grupo");
        });

      };

      $scope.fetchGroup();

    }
  ]);

}(angular));
