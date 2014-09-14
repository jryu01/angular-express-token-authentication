'use strict';
/*jshint expr: true*/

describe('Controller: HomeController', function () {

  // Instantiate a new module before each test
  beforeEach(module('angularTokenAuthApp.controllers'));

  
  // Local variables
  var ctrl, $scope, $state, Auth;

  beforeEach(inject(
    function ($controller, $rootScope, $httpBackend) {

    // Auth Service mock
    Auth = {
      getToken: function () {
        return "tokenMock";
      },
      logout: sinon.spy()
    };

    // $state service mock
    $state = { go: sinon.spy() };

    $httpBackend.expectGET('/api/me')
    .respond(200, {
      id: 123,
      local: {
        email: "test@test.com",
      }, 
      facebook: {
        id: 321
      }
    });

    $scope = $rootScope.$new();
    ctrl = $controller('HomeController', { 
      "$scope": $scope, 
      "$state": $state,
      "Auth": Auth
    });

    $httpBackend.flush();
  }));

  // Test starts

  it('should have set user with proper value', function () {
    expect($scope.user).to.deep.equal({
      id: 123,
      local: {
        email: "test@test.com",
      }, 
      facebook: {
        id: 321
      },
      access_token: "tokenMock"
    });
  });

  it('should call Auth.logout when $scope.logout() called', function () {
    $scope.logout();
    expect(Auth.logout).to.have.been.calledOnce;
  });

  it('should call state.go when $scope.logout() called', function () {
    $scope.logout();
    expect($state.go).to.have.been.calledWith("public.login");
  });

});