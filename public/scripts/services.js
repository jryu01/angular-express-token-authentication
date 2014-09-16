'use strict';

angular.module('angularTokenAuthApp.services', [])
.constant('ACCESS_LEVELS', {
  pub: 1,
  user: 2
})
.provider('facebook', [function () {
  var config = {
    permissions: 'email',
    appId: null,
    version    : 'v2.0'
  };
  var initParams = {};

  this.setAppId = function (appId) {
    config.appId = appId;
    return this;
  };
  this.setInitParams = function (params) {
    initParams = params;
    return this;
  };
  this.setPermissions = function (permissions) {
    config.permission = permissions;
    return this;
  };

  this.$get = ['$q', '$window', '$rootScope', 
  function ($q, $window, $rootScope) {

    // defered facebook servcie object
    var facebook = $q.defer();

    $window.fbAsyncInit = init;

    // Load the facebook SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }($window.document, 'script', 'facebook-jssdk'));

    // define facebook init function
    function init(result) {
      if (!config.appId) {
        throw "facebookProvider: `appId` cannot be null";
      }
      $rootScope.$apply(function() {
        $window.FB.init(angular.extend(config, initParams));
        facebook.resolve($window.FB);
      });
    }

    facebook.getLoginStatus = function (force) {
      var deferred = $q.defer();

      return facebook.promise.then(function (FB) {
        FB.getLoginStatus(function (response) {
          if (response.error) {
            deferred.reject(response.error);
          } else {
            deferred.resolve(response);
          }
          $rootScope.$apply();
        }, force);
        return deferred.promise;
      });
    };

    facebook.login = function (permissions) {
      var deferred = $q.defer();

      if (permissions === undefined) {
        permissions = config.permissions;
      }

      return facebook.promise.then(function (FB) {
        FB.login(function (response) {
          if (response.authResponse) {
            deferred.resolve(response);
          } else {
            deferred.reject("User cncelled login");
          }
          $rootScope.$apply();
        }, { scope: permissions });
        return deferred.promise;
      });
    };
    return facebook;
  }];

}])
.factory('Auth', ['$cookieStore', 'ACCESS_LEVELS', 
function ($cookieStore, ACCESS_LEVELS) {

  var currentUser = $cookieStore.get('user');

  var setUser = function (user) {
    if (!user.role || user.role < 0) {
      user.role = ACCESS_LEVELS.pub;
    }
    currentUser = user;
    $cookieStore.put('user', currentUser);
  };

  return  {
    isAuthorized: function (lvl) {
      var userRole = currentUser ? currentUser.role : ACCESS_LEVELS.pub;
      return userRole >= lvl;
    },
    setUser: setUser,
    isLoggedIn: function () {
      return currentUser ? true : false;
    },
    getUser: function () {
      return currentUser;
    },
    getId: function () {
      return currentUser ? currentUser.id : null;
    },
    getToken: function () {
      return currentUser ? currentUser.access_token : '';
    },
    logout: function () {
      $cookieStore.remove('user');
      currentUser = null;
    }
  };
}]);
