(function (ng) {
  'use strict';

  ng.module('App').directive('mainFlash', [
    function () {
      return {
        templateUrl: '/assets/templates/main/flash.html',
        restrict: 'E',

        scope: false,

        link: function ($scope) {
          $scope.icon = function (type) {
            switch (type) {
              case 'danger':
                return 'warning';

              case 'warning':
                return 'error_outline';

              case 'info':
                return 'info_outline';

              case 'success':
                return 'check_circle';

              default:
                return 'radio_button_unchecked';
            }
          };
        }
      };
    }
  ]);

}(angular));
