(function (ng) {
  'use strict';

  var timeout;
  var config = {
    timeout: 6000,
    url: ''
  };

  ng.module('Session', []).

  factory('$session', [
    '$rootScope', '$timeout',

    function ($rootScope, $timeout) {
      $rootScope.session = {};

      return {
        /**
         * Initialize the session.
         *
         * @param {Object} options The options object.
         */
        init: function (options) {
          if (!options.url) {
            throw new Error("The URL cannot be empty");
          }

          config.url = options.url;
        },

        /**
         * Log's a user in.
         *
         * @param {Object} user The user data to store in the session.
         */
        signin: function (user) {
          $rootScope.session.user = user;
        },

        /**
         * Logs a user out of the session.
         */
        signout: function () {
          $rootScope.session.user = null;
        },

        /**
         * Sets or clears a flash message.
         *
         * @param {String} type The type of the flash message.
         * @param {String} title The title of the flash message.
         * @param {String} message The message body of the flash message.
         */
        flash: function (type, message) {
          var $session = this;

          $timeout.cancel(timeout);

          if (message) {
            $rootScope.session.flash = {
              type: type || 'default',
              message: message
            };

            $timeout(function () {
              $session.flash();
            }, config.timeout);
          } else {
            $rootScope.session.flash = null;
          }
        },

        /**
         * Obtains a value from the user's session object.
         *
         * @param {String} field The key name to get.
         */
        user: function (field) {
          if (field && $rootScope.session.user) {
            return $rootScope.session.user[field];
          }

          return !!$rootScope.session.user;
        },

        /**
         * Obtains a value from the session object.
         *
         * @param {String} key The key name to get.
         */
        get: function (key) {
          return $rootScope.session[key];
        },

        /**
         * Sets a value on the session object.
         *
         * @param {String} key The key name to set.
         * @param {Mixed} value The value of the key.
         */
        set: function (key, value) {
          $rootScope.session[key] = value;
        },

        /**
         * Deletes a value from the session object.
         *
         * @param {String} key The key to delete.
         */
        delete: function (key) {
          delete $rootScope.session[key];
        },

        /**
         * Checks if the current route is allowed to the current user.
         *
         * @param {Object} route The route object to check for.
         * @return {Boolean} Wether the route can be accessed.
         */
        isAllowed: function (route) {
          if (route && route.auth && route.auth.requires && ng.isString(route.auth.requires)) {
            return route.auth.requires === this.user('role');
          } else {
            return false;
          }

          /* Allow all by default */
          return true;
        },

        /**
         * Checks if the current route can be accessed after a login.
         *
         * @param {Object} route The route object to check for.
         * @return {Boolean} Wether the route can be accessed after a login.
         */
        canLogin: function (route) {
          return route && route.auth && route.auth.redirect && ng.isString(route.auth.redirect);
        }
      };
    }

  ]).

  run([
    '$rootScope', '$route', '$session', '$location',

    function ($rootScope, $route, $session, $location) {

      /* Session handling */
      $rootScope.$on('$routeChangeStart', function ($event, $next) {
        var route = $next.$$route;

        $next.$$route.resolve = $next.$$route.resolve || {};

        $next.$$route.resolve.session = [
          '$route', '$session', '$http', '$q',

          function ($route, $session, $http, $q) {
            if (route.auth) {
              var deferred = $q.defer();

              /* Retrieve current session */
              $http.get(config.url).
              success(function (data) {
                /* Session exists and user is logged in */
                $session.signin(data);
              }).

              error(function () {
                $session.signout();
              }).

              finally(function () {
                if ($session.isAllowed(route)) {
                  deferred.resolve();
                } else {
                  deferred.reject();

                  if ($session.canLogin(route)) {
                    $session.set('redirect', $location.path());
                    $location.path(route.auth.redirect);
                  } else {
                    $location.path('/forbidden');
                  }
                }
              });

              return deferred.promise;
            } else {
              return true;
            }
          }
        ];
      });
    }

  ]);

}(angular));
