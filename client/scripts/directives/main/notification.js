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

          $scope.notMessage = function(sender, action) {

            var message = {

              "contact-request": sender + ' te ha enviado una solicitud de contacto!',

              "task-assigned": sender + ' te ha asignado una tarea!',

              "group-invite": sender + ' te ha invitado a un grupo!',

            };

            return message[action];

          };

          $scope.update = function() {

            var actions = 'actions=contact-request&actions=task-assigned&actions=group-invite';

            $http.get('api/notifications?' + actions).

            success(function(nots) {

              $scope.notifications = nots;
            });
          };

          var socket = io.connect(window.location.origin + '/notifications', {
            multiplex: false
          });

          socket.on('connect', function() {
            socket.emit('join', $session.get('user')._id);
          });

          socket.on('joined', function() {
            $scope.message = 'JOINED!!!';
          });

          socket.on('notification', function() {
            console.log('New notification');
            $scope.update();
          });

          $scope.update();

        }
      };
    }

  ]);

}(angular));
