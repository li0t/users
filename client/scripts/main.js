(function(ng) {
  'use strict';

  ng.module('App').

  config([
    '$routeProvider', '$locationProvider', '$mdThemingProvider',

    function($routeProvider, $locationProvider, $mdThemingProvider) {
      $locationProvider.html5Mode(true);

      $mdThemingProvider.theme('default').
      primaryPalette('blue-grey').
      accentPalette('light-green');
    }
  ]).

  constant('APP_NAME', "emeeter").
  constant('YEAR', new Date().getFullYear()).
  constant('DOMAIN', 'https://github.com/finaldevstudio/fi-seed').

  run([
    '$rootScope', '$http', '$session', '$location', 'APP_NAME', 'YEAR', 'DOMAIN',

    function($rootScope, $http, $session, $location, APP_NAME, YEAR, DOMAIN) {
      /* Constants set */
      $rootScope.APP_NAME = APP_NAME;
      $rootScope.DOMAIN = DOMAIN;
      $rootScope.YEAR = YEAR;

      $http.get('/api/session').

      success(function(data) {
        $session.signin(data.user);
        $session.set('group', data.group);
      });

      /* Convenience navigate to method */
      $rootScope.$navigateTo = function(route) {
        $location.path(route);
      };

      /* Convenience signout to method */
      $rootScope.$signout = function() {

        var closed = 0;

        /* Close all open tasks before the signout */
        $http.get('/api/tasks/collaborators/me/working').

        success(function(openTasks) {

          if (openTasks.length) {

            if (confirm('Tienes tareas abiertas! Deseas continuar con el cierre de sesión?')) {

              openTasks.forEach(function(task) {

                $http.put('/api/tasks/' + task + '/worked-time').

                success(function() {
                  closed += 1;
                }).

                error(function() {
                  console.log('Hubo un error cerrando la tarea');
                }).

                finally(function() {

                  if (closed === openTasks.length) {

                    $http.get('/api/users/signout').

                    success(function() {

                      $session.signout();
                      $location.path('/');

                    });
                  }
                });
              });
            }
          } else {
            $http.get('/api/users/signout').

            success(function() {

              $session.signout();
              $location.path('/');

            });
          }
        });
      };
    }
  ]);

}(angular));
