/**
 * Notification Directive.
 *
 * @type AngularJS Directive.
 */

(function(ng) {
  'use strict';

  ng.module('App').directive('mainNotification', [

    '$http',
    '$session',

    function($http, $session) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/notification.html',
        link: function($scope, $element, $attrs) {

          var socket;

          $scope.limit = 10;
          $scope.skip = 0;

          $scope.update = function() {

            var actions = 'actions=contact-request&actions=task-assigned&actions=group-invite';
            var limit = '&limit=' + $scope.limit;
            var skip = '&skip=' + $scope.skip;

            $http.get('api/notifications?' + actions + limit + skip).

            success(function(nots) {
              console.log(nots.length);
              console.log(nots);
              $scope.notifications = nots;

            });
          };

          $scope.viewed = function(not) {

            $http.put('api/notifications/' + not._id + '/viewed').

            success(function() {
              not.viewed = true;
            }).

            error(function(err) {
              console.log(err);
            });
          };

          $scope.notMessage = function(sender, action) {

            var message = {
              "contact-request": sender + ' te ha enviado una solicitud de contacto!',

              "task-assigned": sender + ' te ha asignado una tarea!',

              "group-invite": sender + ' te ha invitado a un grupo!',
            };

            return message[action];
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

          $scope.getLast = function() {
            console.log('gemeyoh!');
            var actions = 'actions=contact-request&actions=task-assigned&actions=group-invite';

            $http.get('api/notifications/last?' + actions).

            success(function(not) {
              console.log(not);
              $scope.notifications.unshift(not);
            });
          };

          socket = io.connect(window.location.origin + '/notifications', {
            multiplex: false
          });

          socket.on('connect', function() {
            socket.emit('join', $session.get('user')._id);
          });

          socket.on('joined', function() {
            console.log('joined event');
            $scope.message = 'JOINED!!!';
          });

          socket.on('notification', function() {
            console.log('ok notified! thx');
            $scope.getLast();
          });

          $scope.update();

        }
      };
    }

  ]);

}(angular));
