'use strict';
/*jshint expr: true*/

describe('Controller: RegisterController', function () {

  beforeEach(module('angularTokenAuthApp.controllers'));

  var ctrl, $scope, $httpBackend; 

  beforeEach(inject(
    function (_$controller_, _$rootScope_, _$httpBackend_) {

    $scope = _$rootScope_.$new();
    $httpBackend = _$httpBackend_;
    ctrl = _$controller_('RegisterController', {
      "$scope": $scope,
      "$state": { go: sinon.spy() },
      "Auth": { setUser: sinon.spy() },
      "facebook": null,
      "ACCESS_LEVELS": { user: 2, pub: 1}
    });
  }));
  it("NYI", function () {
    throw("NYI");
  });
});