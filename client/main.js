(function (ng) {
  'use strict';

  ng.module('App').

  config([
    '$routeProvider', '$locationProvider',

    function ($routeProvider, $locationProvider) {
      /** Not found route **/
      $routeProvider.

      otherwise({
        redirectTo: '/notfound'
      }).

      when('/notfound', {
        templateUrl: '/templates/notfound.html'
      });

      $locationProvider.html5Mode(true);
    }
  ]).

  run([
    '$rootScope', '$location', '$session', '$http', '$moment',

    function ($rootScope, $location, $session, $http, $moment) {

      /* Initialize the session */
      $session.init({
        url: '/api/session'
      });

      /* Calculate server time difference */
      $session.set('timeDiff', 0);

      var start = Date.now();

      $http.get('/api/time').success(function (data) {
        var now = Date.now(),
          time = Number(data) + (now - start),
          diff = now - time;

        $moment.setServerDiff(diff);
      });
    }
  ]);

}(angular));
