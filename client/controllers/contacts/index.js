(function(ng) {
  'use strict';

  ng.module('App').controller('Contacts:Index', [
    '$scope', '$http', '$location', '$session',

    function($scope, $http, $location, $session) {
      $scope.fetchingContacts = null;
      $scope.fetchingPending = null;
      $scope.notFoundUser = null;
      $scope.foundUser = null;
      $scope.contacts = null;
      $scope.pendings = null;

      $scope.fetchContacts = function() {
        $scope.fetchingContacts = true;

        $http.get('/api/contacts').

        success(function(data) {
          $scope.contacts = data;
        }).

        finally(function() {
          $scope.fetchingContacts = false;
        });

      };

      $scope.fetchPending = function() {
        $scope.fetchingPending = true;

        $http.get('/api/contacts/pending').

        success(function(data) {
          $scope.pendings = data;
        }).

        finally(function() {
          $scope.fetchingPending = false;
        });

      };

      $scope.search = function() {

        if ($scope.searchContact !== $session.get('user').email) {

          $http.post('/api/search/email', {
            email: $scope.searchContact
          }).

          success(function(data) {
            $session.flash('success', 'Usuario encontrado!');
            $scope.foundUser = data;

          }).

          error(function() {
            $session.flash('warning', 'Usuario no encontrado!');
            $scope.notFoundUser = $scope.searchContact;
          });
        } else {
          $session.flash('success', 'Ese eres tu, genial!');
        }
      };

      $scope.resetFound = function() {
        $scope.foundUser = null;
        $scope.notFoundUser = null;
      };

      $scope.inviteNotFound = function() {

        $http.post('/api/users/invited', { email: $scope.notFoundUser }).

        success(function(user) {

          $http.post('/api/contacts', { id: user }).

          success(function(user) {

            $http.post('/api/mandrill/invite', { id: user }).

            success(function() {
              $scope.searchContact = null;
              $scope.notFoundUser = null;
              $session.flash('success', 'Bien! Has invitado un amigo a emeeter.');

            }).error(function() {
              $session.flash('danger', 'An error ocurred!');
            });
          }).error(function() {
            $session.flash('danger', 'An error ocurred!');
          });
        }).error(function() {
          $session.flash('danger', 'An error ocurred!');
        });
      };

      $scope.fetchContacts();
      $scope.fetchPending();

    }
  ]);

}(angular));
