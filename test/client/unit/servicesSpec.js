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
  beforeEach(inject(function ($injector) {
    Auth = $injector.get('Auth');
  }));

  //TODO: with user cookie and without user cookie 
  it('should call $cookieStore.get on initialization', function () {
    expect(cookieStoreMock.get).to.have.been.calledWith('user');
  });

  describe('#setUser', function () {
    it('should call $cookieStore.put whend its called', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      Auth.setUser(user);

      expect(cookieStoreMock.put).to.have.been.calledWith('user', user);
    });

    it('should set user properly', function () {
      var user = { id: 123, role: 2, access_token: "token123" } ;
      Auth.setUser(user);

      expect(Auth.getUser()).to.deep.equal(user);
    });

    it('should set user role properly when given user\'s role is invalid', function () {

      var user = { id: 123, access_token: "token123" };
      var user2 = { id: 123, role: 0, access_token: "token123"};

      Auth.setUser(user);
      expect(Auth.getUser().role).to.equal(ACCESS_LEVELS_MOCK.pub);

      Auth.setUser(user2);
      expect(Auth.getUser().role).to.equal(ACCESS_LEVELS_MOCK.pub);
    });
  });

  describe('#isAuthorized', function () {
    it('should work properly', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      
      Auth.setUser(user);

      expect(Auth.isAuthorized(1)).to.be.true;
      expect(Auth.isAuthorized(2)).to.be.true;
      expect(Auth.isAuthorized(3)).to.be.false;
    });
  });

  describe('#isLoggedIn', function () {
    it('should return trun when there is current user', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      
      Auth.setUser(user);
      expect(Auth.isLoggedIn()).to.be.true;
    });
    it('should return false when there is no current user', function () {
      expect(Auth.isLoggedIn()).to.be.false;
    });
  });

  describe('#getId', function () {
    it('should return user id when user is set', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      
      Auth.setUser(user);
      expect(Auth.getId()).to.equal(123);
    });
    it('should return null when there is no current user', function () {
      expect(Auth.getId()).to.be.null;
    });
  });

  describe('#getToken', function () {
    it('should return user id when user is set', function () {
      var user = { id: 123, role: 2, access_token: "token123" };
      Auth.setUser(user);
      expect(Auth.getToken()).to.equal("token123");
    });
    it('should return empty when there is no current user', function () {
      expect(Auth.getToken()).to.be.empty;
    });
  });

  describe('#logout', function () {
    it('should call $cookieStore.remove and set null to current user', 
      function () {
      var user = { id: 123, role: 2, access_token: "token123" };

      Auth.setUser(user);
      expect(Auth.getUser()).to.be.not.null;

      Auth.logout();
      expect(cookieStoreMock.remove).to.have.been.calledWith('user');
      expect(Auth.getUser()).to.be.null;
    });

  });
});