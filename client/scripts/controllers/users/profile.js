(function(ng) {
  'use strict';

  ng.module('App').controller('Users:Profile', [
    '$scope', '$http', '$location', '$session', '$routeParams', 'Upload', 'statics',

    function($scope, $http, $location, $session, $routeParams, $upload, statics) {

      $scope.filesSupported = 'image/*';
      $scope.statics = statics;
      $scope.files = [];

      function updateProfilePic() {

        $http.get('/api/session/pictures').

        success(function(pics) {
          $session.get('user').profile.pictures = pics;
        }).

        error(function() {
          $session.flash('danger', "Hubo error actualizando la foto de perfil");
        }).
        finally(function() {
          $scope.fetching = false;
        });
      }

      $scope.discard = function(index) {
        $scope.files.splice(index, 1);
      };

      $scope.fetch = function() {

        $scope.fetching = true;

        $http.get('/api/users/' + $routeParams.id).

        success(function(user) {
          user.profile.birthdate = user.profile.birthdate && new Date(user.profile.birthdate);
          $scope.user = user;
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
          $scope.files = [];
          $scope.fetch();
          updateProfilePic();
        }).

        error(function() {
          $session.flash('danger', "Hubo un error subiendo la foto");
        }).

        finally(function() {
          $scope.submitting = false;
        });

      };

      $scope.select = function(pic) {

        $scope.setting = true;

        $http.put('/api/users/profiles/pictures/' + pic).

        success(function() {
          $scope.fetch();
          updateProfilePic();
        }).

        error(function() {
          $session.flash('danger', "Hubo error escogiendo tu foto de perfil");
        }).

        finally(function() {
          $scope.setting = false;
        });

      };

      $scope.fetch();

    }
  ]);

}(angular));
