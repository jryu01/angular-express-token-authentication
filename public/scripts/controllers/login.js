'use strict';

angular.module('angularSessionAuthApp')
.controller('LoginController', ['$scope', '$http', '$state', 'Auth', 
  'ACCESS_LEVELS', function ($scope, $http, $state, Auth, ACCESS_LEVELS) {
  $scope.signinData = {}; 
  $scope.signin = function () {
    $http
    .post('/signin', $scope.signinData)
    .success(function (data, status, headers, config) {
      var user = data.user;
      user.access_token = data.access_token;
      user.role = ACCESS_LEVELS.user; 
      Auth.setUser(user);
      $state.go('user.home');
    })
    .error(function (data, status, headers, config) {
      $scope.loginForm.serverError = {
        message : 'Error: Attempt failed'
      };
      if (data.message) {
        $scope.loginForm.serverError.message = data.message;
      }
    });
  };
}]);
