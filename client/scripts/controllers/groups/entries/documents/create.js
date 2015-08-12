(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Documents:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      $scope.data = {
        group: $session.get('group')._id
      };

      $scope.submit = function() {
        $scope.fetching = true;

        $scope.data.group = $session.get('group')._id;

        $http.post('/api/entries/', $scope.data).

        success(function(entry) {

          $http.post('/api/entries/' + entry + '/documents', $scope.files).

          success(function() {
            $session.flash('success', 'Entrada creada con éxito');
          }).

          error(function() {
            $session.flash('danger', 'Hubo un error creando la entrada');
          }).
          finally(function() {
            location.path('/groups/' + $session.get('group')._id + '/entries');
          });
        }).
        error(function() {
          $session.flash('danger', 'Hubo un error creando la entrada');
        });
      };

    }
  ]);

}(angular));
