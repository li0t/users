(function (ng) {
  'use strict';

  ng.module('App').directive('mainFooter', [
    '$window', '$location', '$http', '$session', '$timeout', 'APP_NAME', 'YEAR',

    function ($window, $location, $http, $session, $timeout, APP_NAME, YEAR) {

      return {
        scope: {},
        restrict: 'E',
        templateUrl: '/assets/templates/main/footer.html',
        link: function ($scope) {
          $scope.APP_NAME = APP_NAME;
          $scope.YEAR = YEAR;

          $scope.data = {};

          $scope.submit = function () {

            $scope.submitting = true;

            $http.post('api/contact', $scope.data).

            success(function () {
              $session.flash('success', "¡Muchas gracias!", "Tu mensaje fue recibido.");
              $scope.data = null;
            }).

            error(function () {
              $session.flash('danger', "Pucha,", "no pudimos enviar tu mensaje.");
            }).

            finally(function () {
              $timeout(function () {
                $scope.submitting = false;
              }, 1000);
            });
          };

        }
      };

    }

  ]);

}(angular));
