(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Validate', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      console.log('VALIDATING');

      $http.put('/api/users/validate/' + $routeParams.token).

      success(function(user) {
        $session.set('user', user);
        $location.path('/welcome');
        $session.flash('success', 'Welcome to emeeter ' + user.email + '!');

      }).error(function() {
        $session.flash('danger', 'This token is not valid!');

      });

    }
  ]);

}(angular));
