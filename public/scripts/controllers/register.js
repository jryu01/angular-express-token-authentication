'use strict';

angular.module('angularTokenAuthApp')
.controller('RegisterController', ['$scope', '$http', '$state', 'Auth',
  'ACCESS_LEVELS', function ($scope, $http, $state, Auth, ACCESS_LEVELS) {
    
  $scope.signupData = {}; 

  $scope.signup = function () {
    $http
    .post('/signup', $scope.signupData)
    .success(function (data, status, headers, config) {
      var user = {};
      user.userId = data.user.id;
      user.access_token = data.access_token;
      user.role = ACCESS_LEVELS.user; 
      Auth.setUser(user);
      $state.go('user.home');
    })
    .error(function (data, status, headers, config) {
      $scope.signupForm.serverError = {
        message : 'Error: Attempt failed'
      };
      if (data.message) {
        $scope.signupForm.serverError.message = data.message;
      }
    });
  };

}]);