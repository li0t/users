(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Notes', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      $scope.data = {
        group: $session.get('group')._id
      };


      $scope.submit = function() {
        $scope.submitting = true;

        $scope.data.group = $session.get('group')._id;

        $http.post('/api/entries/', $scope.data).

        success(function() {
          $session.flash('success', 'Entrada creada con éxito');
        }).

        error(function() {
          $session.flash('danger', 'Hubo un error creando la entrada');
        }).

        finally(function() {
          $scope.submitting = false;
          $location.path('/groups/' + $session.get('group')._id + '/entries/note');
        });
      };

    }
  ]);

}(angular));
