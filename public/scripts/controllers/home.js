'use strict';

angular.module('angularTokenAuthApp.controllers', [])
.controller('HomeController', ['$scope', '$state', '$http', 'Auth',
  function ($scope, $state, $http, Auth) {

  $http.get('/api/me').success(function (user) {
    user.access_token = Auth.getToken();
    $scope.user = user;
  });

  $scope.logout = function () {
    Auth.logout();
    $state.go('public.login');
  };
}]);
