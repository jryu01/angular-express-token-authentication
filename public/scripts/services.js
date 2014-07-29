'use strict';

angular.module('angularSessionAuthApp')
.factory('Auth', ['$http', function ($http) {
  return {
    signout: function (success, error) {
      $http.post('/signout').success(success).error(error);
    }
  };
}])
.factory('Users', ['$http', function ($http) {
  return {
    list: function (success, error) {
      $http.get('/api/users').success(success).error(error);
    }
  };
}])
.factory('Auth', ['$cookieStore', 'ACCESS_LEVELS', 
function ($cookieStore, ACCESS_LEVELS) {
  var _user = $cookieStore.get('user');

  var setUser = function (user) {
    if (!user.role || user.role < 0) {
      user.role = ACCESS_LEVELS.pub;
    }
    _user = user;
    $cookieStore.put('user', _user);
  };

  return  {
    isAuthorized: function (lvl) {
      var userRole = _user ? _user.role : ACCESS_LEVELS.pub;
      return userRole >= lvl;
    },
    setUser: setUser,
    isLoggedIn: function () {
      return _user ? true : false;
    },
    getUser: function () {
      return _user;
    },
    getId: function () {
      return _user ? _user.id : null;
    },
    getToken: function () {
      return _user ? _user.access_token : '';
    },
    logout: function () {
      $cookieStore.remove('user');
      _user = null;
    }
  };
}]);
