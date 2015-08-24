(function(ng) {
  'use strict';

  ng.module('App').controller('Entries:Create', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {

      $scope.tags = [];

      $scope.data = {
        group: $session.get('user').group._id,
        tags: []
      };

      $scope.submit = function() {

        $http.post('/api/entries', $scope.data).

        success(function(entry) {

          if ($scope.data.tags.lenght) {

            $http.post('/api/entries/' + entry +'/tags', $scope.data).

            success(function() {

                $location.path('/entries');
                $session.flash('success', 'Entrada creada con éxito!');
            }).

            error(function(data) {
              $session.flash('danger', data);
            });

          } else {
            $location.path('/entries');
            $session.flash('success', 'Entrada creada con éxito!');
          }
        }).
        error(function(data) {
          $session.flash('danger', data);
        });
      };

      $scope.removeTag = function(tag) {
        var index = $scope.data.tags.indexOf(tag);
        if (index >= 0) {
          $scope.data.tags.splice(index,1);
        }
      };

    }
  ]);

}(angular));
