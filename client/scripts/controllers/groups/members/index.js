(function(ng) {
  'use strict';

  ng.module('App').controller('Groups:Members', [
    '$scope', '$http', '$location', '$session', '$routeParams',

    function($scope, $http, $location, $session, $routeParams) {

      $scope.group = $session.get('group');
      $scope.membersToRemove = null;
      $scope.fetching = null;
      $scope.members = null;

      $scope.admin = $scope.group && ($scope.group.admin._id === $session.get('user')._id) ? $scope.group.admin._id : null;

      $scope.fetch = function() {

        $scope.membersToRemove = [];
        $scope.fetching = true;

        $http.get('/api/groups/members/of/' + $routeParams.id).

        success(function(data) {

          data.forEach(function(member) {
            if (member.user.email === $session.get('user').email) {

              if (member.user.profile.name) {
                member.user.profile.name += " (me)";
              } else {
                member.user.email += " (me)";
              }
            }

            if ($scope.group && member.user._id === $scope.group.admin._id) {

              if (member.user.profile.name) {
                member.user.profile.name += " (admin)";
              } else {
                member.user.email += " (admin)";
              }
            }
          });

          $scope.members = data;
        }).

        finally(function() {
          $scope.fetching = false;
        });
      };

      $scope.addOrRemove = function(member) {

        if ($scope.admin) {
          if (member !== $scope.admin) {
            var indexOf = $scope.membersToRemove.indexOf(member);

            if (indexOf > -1) {
              $scope.membersToRemove.splice(indexOf, 1);
            } else {
              $scope.membersToRemove.push(member);
            }
          }
        }
      };

      $scope.removeMembers = function() {

        if ($scope.admin) {

          $http.post('/api/groups/members/remove-from/' + $routeParams.id, {
            members: $scope.membersToRemove
          }).

          success(function() {
            $scope.fetch();
            $session.flash('success', 'Miembros eliminados con éxito!');
          }).

          error(function() {
            $session.flash('danger', 'Hubo un error elimando miembros!');
          });

        }
      };

      $scope.fetch();
    }
  ]);

}(angular));
