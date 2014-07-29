'use strict';

angular.module('angularSessionAuthApp')
.controller('HomeController', ['$scope', '$state', 'Auth', 
  function ($scope, $state, Auth) {
  $scope.user = Auth.getUser();
  $scope.logout = function () {
    Auth.logout();
    $state.go('public.login');
  };
}]);
