'use strict';
/*jshint expr: true*/

describe('Controller: RegisterController', function () {

  beforeEach(module('angularTokenAuthApp.controllers'));

  var ctrl, $scope, $httpBackend, $state, Auth, ACCESS_LEVELS; 

  beforeEach(inject(
    function (_$controller_, _$rootScope_, _$httpBackend_, $q) {

    // service mocks 
    $state = { go: sinon.spy() };
    Auth = { setUser: sinon.spy() };
    ACCESS_LEVELS = { user: 2, pub: 1};

    $scope = _$rootScope_.$new();
    $httpBackend = _$httpBackend_;
    ctrl = _$controller_('RegisterController', {
      "$scope": $scope,
      "$state": $state,
      "Auth": Auth,
      "ACCESS_LEVELS": ACCESS_LEVELS
    });
  }));

  it('should set signinData obj to scope', function () {
    expect($scope.signupData).to.be.not.be.undefined;
    expect($scope.signupData.grantType).to.equal('password');
  });

  it('should have properly working signup function on success', function () {
    $httpBackend.expectPOST('/signup').respond({
      user: {id: 123},
      access_token: "token",
    });
    $scope.signup();  
    $httpBackend.flush();

    var user = { access_token: "token", role: 2, userId: 123 };

    expect(Auth.setUser).to.have.been.calledWith(user);
    expect($state.go).to.have.been.calledWith('user.home');
  });

  it('should have proper error handling with signup function', function () {

    $httpBackend.expectPOST('/signup').respond(500, {});
    $scope.signup();
    $httpBackend.flush();
    expect($scope.signupForm.serverError).to.be.deep.equal({
      message: 'Error: Attempt failed'
    });

    $httpBackend.expectPOST('/signup').respond(500, {
      message: 'server message'       
    });
    $scope.signup();
    $httpBackend.flush();
    expect($scope.signupForm.serverError).to.be.deep.equal({
      message: 'server message'
    });

  });
});