'use strict';
/*jshint expr: true*/

describe('Controller: LoginController', function () {

  beforeEach(module('angularTokenAuthApp.controllers'));

  var ctrl, $scope, $httpBackend, $state, Auth, ACCESS_LEVELS, facebook; 

  beforeEach(inject(
    function (_$controller_, _$rootScope_, _$httpBackend_, $q) {

    // service mocks 
    $state = { go: sinon.spy() };
    Auth = { setUser: sinon.spy() };
    ACCESS_LEVELS = { user: 2, pub: 1};
    facebook = {
      login: function () {
        var deferred = $q.defer();
        deferred.resolve({
          authResponse: { accessToken: "fakeToken" }
        });
        return deferred.promise;
      }
    };

    $scope = _$rootScope_.$new();
    $httpBackend = _$httpBackend_;
    ctrl = _$controller_('LoginController', {
      "$scope": $scope,
      "$state": $state,
      "Auth": Auth,
      "facebook": facebook,
      "ACCESS_LEVELS": ACCESS_LEVELS
    });
  }));

  it('should set signinData obj to scope', function () {
    expect($scope.signinData).to.be.not.be.undefined;
    expect($scope.signinData.grantType).to.equal('password');
  });

  it('should have properly working signin function on success', function () {
    $httpBackend.expectPOST('/signin').respond({
      user: {id: 123},
      access_token: "token",
    });
    $scope.signin();  
    $httpBackend.flush();

    var user = { access_token: "token", role: 2, userId: 123 };

    expect(Auth.setUser).to.have.been.calledWith(user);
    expect($state.go).to.have.been.calledWith('user.home');
  });

  it('should have proper error handling with signin function', function () {

    $httpBackend.expectPOST('/signin').respond(500, {});
    $scope.signin();
    $httpBackend.flush();
    expect($scope.loginForm.serverError).to.be.deep.equal({
      message: 'Error: Attempt failed'
    });

    $httpBackend.expectPOST('/signin').respond(500, {
      message: 'server message'       
    });
    $scope.signin();
    $httpBackend.flush();
    expect($scope.loginForm.serverError).to.be.deep.equal({
      message: 'server message'
    });

  });
  
  it('should have working signinWithFacebook function on $scope', 
    function () {
      $httpBackend.expectPOST('/api/access_token').respond({
        user: {id: 123},
        access_token: "fakeToken",
      });
      $scope.signinWithFacebook();
      $httpBackend.flush();

      var user = { access_token: "fakeToken", role: 2, userId: 123 };

      expect(Auth.setUser).to.have.been.calledWith(user);
      expect($state.go).to.have.been.calledWith('user.home');

  });
  it('should have proper error handling with signinWithFacebook function', function () {

    $httpBackend.expectPOST('/api/access_token').respond(500, {});
    $scope.signinWithFacebook();
    $httpBackend.flush();
    expect($scope.loginForm.serverError).to.be.deep.equal({
      message: 'Error: Attempt failed'
    });

    $httpBackend.expectPOST('/api/access_token').respond(500, {
      message: 'server message'       
    });
    $scope.signinWithFacebook();
    $httpBackend.flush();
    expect($scope.loginForm.serverError).to.be.deep.equal({
      message: 'server message'
    });

  });
});