/**
 * Notification Directive.
 *
 * @type AngularJS Directive.
 */

(function (ng) {
  'use strict';

  ng.module('App').directive('mainNotification', [

    '$session',

    function ($session) {

      return {
        restrict: 'E',
        templateUrl: '/assets/templates/main/notification.html',
        link: function ($scope, $element, $attrs) {

          var socket = io.connect(window.location.origin + '/notifications', { multiplex: false });

          socket.on('connect', function() {
            socket.emit('join', $session.get('user')._id);
          });

          socket.on('joined', function() {
            $scope.message = 'JOINED!!!';
          });
        }
      };
    }

  ]);

}(angular));
