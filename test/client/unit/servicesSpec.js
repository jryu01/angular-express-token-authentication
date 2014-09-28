'use strict';
/*jshint expr: true*/

describe('Service: ACCESS_LEVELS', function () {

  var ACCESS_LEVELS;

  beforeEach(module('angularTokenAuthApp.services'));  

  beforeEach(inject(function ($injector) {
    ACCESS_LEVELS = $injector.get('ACCESS_LEVELS');
  }));

  it('should have proper properties and values', function () {
    expect(ACCESS_LEVELS).to.deep.equal({ 
      pub: 1, 
      user: 2 
    });
  });
});

describe('Service: Auth', function () {

  var Auth, cookieStoreMock, ACCESS_LEVELS_MOCK;

  // load module with cookieStroeMock and ACESS_LEVELS mock
  beforeEach(module('angularTokenAuthApp.services', function ($provide) {
    cookieStoreMock = sinon.stub({
      get: function () {}, 
      put: function () {},
      remove: function () {}
    });
    ACCESS_LEVELS_MOCK = {pub: 1};
    $provide.value('$cookieStore', cookieStoreMock);
    $provide.value('ACCESS_LEVELS', ACCESS_LEVELS_MOCK);
  }));

  describe('without set current user', function () {

    beforeEach(inject(function ($injector) {
      cookieStoreMock.get.returns(null);
      Auth = $injector.get('Auth');
    }));

    it('should call $cookieStore.get on initialization', function () {
      expect(cookieStoreMock.get).to.have.been.calledWith('user');
    });

    it('should not authorized to user level', function () {
      expect(Auth.isAuthorized(2)).to.be.false;
    });

    it('should not have user logged in', function () {
      expect(Auth.isLoggedIn()).to.be.false;
    });

    it('should not have an user', function () {
      expect(Auth.getUser()).to.be.not.ok;
    });

    it('should not have an unser id', function () {
      expect(Auth.getId()).to.be.not.ok;
    });

    it('should not have an access_token', function () {
      expect(Auth.getToken()).to.be.not.ok;
    });

    it('should be able to set user', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      Auth.setUser(user);
      expect(Auth.getUser()).to.deep.equal(user);
    });

    it('should put user to cookieStore', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      Auth.setUser(user);
      expect(cookieStoreMock.put).to.have.been.calledWith('user', user);
    });

    it('should set user role properly when given user\'s role is invalid',
      function () {
      expect(Auth.getUser()).to.be.not.ok;
      var user = { id: 123, access_token: "token123" };
      var user2 = { id: 123, role: 0, access_token: "token123"};

      Auth.setUser(user);
      expect(Auth.getUser().role).to.equal(ACCESS_LEVELS_MOCK.pub);

      Auth.setUser(user2);
      expect(Auth.getUser().role).to.equal(ACCESS_LEVELS_MOCK.pub);

    });

  });

  describe('with set user from cookie', function () {

    beforeEach(inject(function ($injector) {
      cookieStoreMock.get.returns({id:123, role: 2, access_token: "token123"});
      Auth = $injector.get('Auth');
    }));

    it('should authorized to user level', function () {
      expect(Auth.isAuthorized(2)).to.be.true;
    });

    it('should have user logged in', function () {
      expect(Auth.isLoggedIn()).to.be.true;
    });

    it('should have an user', function () {
      expect(Auth.getUser()).to.be.deep.equal({
        id:123, 
        role:2,
        access_token: "token123" 
      });
    });

    it('should have an unser id', function () {
      expect(Auth.getId()).to.equal(123);
    });

    it('should have an access_token', function () {
      expect(Auth.getToken()).to.equal('token123');
    });

    it('should be able to log out current user', function () {
      Auth.logout();
      expect(cookieStoreMock.remove).to.have.been.calledWith('user');
      expect(Auth.getUser()).to.be.null;
    });

  });
});