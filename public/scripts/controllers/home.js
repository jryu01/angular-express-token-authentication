'use strict';

angular.module('angularTokenAuthApp')
.controller('HomeController', ['$scope', '$state', 'Auth', 
  function ($scope, $state, Auth) {
  $scope.user = Auth.getUser();
  $scope.logout = function () {
    Auth.logout();
    $state.go('public.login');
  };
}]);
