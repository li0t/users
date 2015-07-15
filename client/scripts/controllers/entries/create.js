(function (ng) {
  'use strict';

  ng.module('App').controller('Entries:Create', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {
      $scope.data = {};

      $scope.submit = function() {

        $http.post('/api/entries', $scope.data).

        success(function() {
          $location.path('/entries');
          $session.flash('success', 'Entrada creada con éxito!');
        }).

        error(function(data) {
          $session.flash('danger', data);
        });
      };
    }
  ]);

}(angular));
