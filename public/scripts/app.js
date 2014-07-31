'use strict';

angular.module('angularTokenAuthApp', ['ui.router', 
  'ngCookies',
  'angularTokenAuthApp.services'
  ])
.constant('ACCESS_LEVELS', {
  pub: 1,
  user: 2
})
.config(['$stateProvider','$urlRouterProvider', '$locationProvider', '$httpProvider', 'ACCESS_LEVELS', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, ACCESS_LEVELS) {

  //================================================
  // Route configurations 
  //================================================

  // Public routes
  $stateProvider
    .state('public', {
      abstract: true,
      template: "<div ui-view></div>",
      data: {
        accessLevel: ACCESS_LEVELS.pub
      } 
    })
    .state('public.login', {
      url: '/login',
      templateUrl: '/views/partials/login.html',
      controller: 'LoginController'
    })
    .state('public.register', {
      url: '/register',
      templateUrl: '/views/partials/register.html',
      controller: 'RegisterController'
    });

  // Regular user routes
  $stateProvider
    .state('user', {
      abstract: true,
      template: "<div ui-view></div>",
      data: {
        accessLevel: ACCESS_LEVELS.user
      }
    })
    .state('user.home', {
      url: '/',
      templateUrl: '/views/partials/home.html',
      controller: 'HomeController'
    });
  
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');

}])
.config(['facebookProvider', function (facebookProvider) {
  facebookProvider.setAppId(481914391941067);
}])
.run(['$rootScope', '$state', 'Auth', function ($rootScope, $state, Auth) {

  $rootScope.$on('$stateChangeStart', 
    function (event, toState, toParams, fromState, fromParams) {
    if (!Auth.isAuthorized(toState.data.accessLevel)) {
      if (Auth.isLoggedIn()) {
        // the user is logged in, but does not have permissions
        // to view the view 
        event.preventDefault();
        $state.go('user.home');
      } else {
        event.preventDefault();
        $state.go('public.login');
      }
    }
  });
}]);