/**
 * Notification Directive.
 *
 * @type AngularJS Directive.
 */

(function(ng) {
  'use strict';

  ng.module('App').directive('mainNotification', [

    '$http',
    '$timeout',
    '$session',

    function($http, $timeout, $session) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/notification.html',
        link: function($scope) {

          var actions = 'actions=contact-request&actions=task-assigned&actions=task-expired-one-week&actions=group-invite';
          var socket;

          $scope.limit = 10;
          $scope.skip = 0;

          $scope.update = function() {


            var limit = '&limit=' + $scope.limit;
            var skip = '&skip=' + $scope.skip;

            $http.get('api/notifications?' + actions + limit + skip).

            success(function(nots) {

              nots.forEach(function(not) {
                config(not);
              });

              $scope.notifications = nots;

            });
          };

          $scope.viewed = function(not) {

            if (!not.viewed) {

              $http.put('api/notifications/' + not._id + '/viewed').

              success(function() {
                $timeout(function() {
                    not.viewed = true;
                }, 500);
              }).

              error(function(err) {
                console.log(err);
              });
            }

          };

          $scope.filter = function(nots) {

            function by(state) {

              switch (state) {

                case 'unseen':
                  return nots.filter(function(not) {
                    return !not.viewed;
                  });

                case 'seen':
                  return nots.filter(function(not) {
                    return not.viewed;
                  });

              }
            }

            return {
              by: by
            };

          };

          function getLast() {

            $http.get('api/notifications/last?' + actions).

            success(function(not) {
              config(not);
              $scope.notifications.unshift(not);
            });
          }

          function config(not) {

            var cfg = {
              "contact-request": {
                message: not.interaction.sender && not.interaction.sender.email + ' te ha enviado una solicitud de contacto!',
                href: '/contacts'
              },

              "task-assigned": {
                message: not.interaction.sender && not.interaction.sender.email + ' te ha asignado una tarea!',
                href: '/tasks/' + not.interaction.modelRelated + '/detail'
              },

              "task-expired-one-week": {
                message: 'Tienes una tarea pendiente hace una semana!',
                href: '/tasks/' + not.interaction.modelRelated + '/detail'
              },

              "group-invite": {
                message: not.interaction.sender && not.interaction.sender.email + ' te ha invitado a un grupo!',
                href: '/groups/' + not.interaction.modelRelated + '/profile'
              },
            };

            not.message = cfg[not.interaction.action.slug].message;
            not.href = cfg[not.interaction.action.slug].href;

          }

          socket = io.connect(window.location.origin + '/notifications', {
            multiplex: false
          });

          socket.on('connect', function() {
            socket.emit('join', $session.user('_id'));
          });

          socket.on('joined', function() {
            console.log('joined event');
          });

          socket.on('notification', function() {
            getLast();
          });

          $scope.update();

        }
      };
    }

  ]);

}(angular));
