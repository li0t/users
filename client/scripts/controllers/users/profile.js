(function (ng) {
  'use strict';

  ng.module('App').controller('Users:Profile', [
    '$scope', '$http', '$location', '$session',

    function ($scope, $http, $location, $session) {

      if (!$session.get('user')) {

        $location.path('/');

      }
    }
  ]);

}(angular));
