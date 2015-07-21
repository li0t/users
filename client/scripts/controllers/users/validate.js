(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Validate', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {
      $http.put('/api/users/validate/' + $routeParams.token).

      success(function(user) {
        $session.signin(user);
        $location.path('/welcome');
        $session.flash('success', 'Account activated, Welcome to emeeter!');

      }).error(function() {
        $location.path('/');
        $session.flash('danger', 'This token is not valid!');
      });

    }
  ]);

}(angular));
