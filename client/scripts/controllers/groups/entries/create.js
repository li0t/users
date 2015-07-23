(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Entries:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      $scope.data = {
        group: $session.get('group')._id
      };


      $scope.submit = function() {
        $scope.fetching = true;

        $http.post('/api/entries/groups/', $scope.data).

        success(function() {
          $location.path('/groups/' + $session.get('group')._id + '/entries');
          $session.flash('success', 'Entrada creada con éxito');
        }).

        error(function() {
          $location.path('/groups/' + $session.get('group')._id + '/entries');
          $session.flash('danger', 'Hubo un error creando la entrada');
        });
      };

    }
  ]);

}(angular));
