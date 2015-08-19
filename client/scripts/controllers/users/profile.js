(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams', 'Upload', 'statics',

    function($scope, $http, $location, $session, $routeParams, $upload, statics) {

      $scope.filesSupported = 'image/*';
      $scope.statics = statics;
      $scope.fetching = false;
      $scope.user = null;
      $scope.files = [];

      $scope.discard = function(index) {
        $scope.files.splice(index, 1);
      };

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/users/' + $routeParams.id).

        success(function(user) {
          user.profile.birthdate = user.profile.birthdate && new Date(user.profile.birthdate);
          $scope.user = user;
          console.log(user.profile.pictures);
        }).

        error(function() {
          $session.flash('danger', "Hubo error obteniendo la información del usuario");
        }).
        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.submit = function() {
        $scope.submitting = true;

        $http.put('/api/users/profiles', $scope.user.profile).

        error(function() {
          $scope.fetch();
          $session.flash('danger', "Hubo error actualizando la información del usuario");
        }).
        finally(function() {
          $scope.submitting = false;
        });
      };

      $scope.upload = function() {

        $scope.submitting = true;

        $upload.upload({
          url: '/api/users/profiles/pictures',
          file: $scope.files,
        }).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', "Hubo un error subiendo la foto");
        }).

        finally(function() {
          $scope.submitting = false;
        });

      };

      $scope.select = function (pic) {

        $scope.submitting = true;

        $http.put('/api/users/profiles/pictures/' + pic).

        success(function() {
          $scope.fetch();
        }).

        error(function() {
          $session.flash('danger', "Hubo error escogiendo tu foto de perfil");
        }).

        finally(function() {
          $scope.submitting = false;
        });

      };

      $scope.fetch();

    }
  ]);

}(angular));
