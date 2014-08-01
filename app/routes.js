
/**
 * app/routes.js
 */

'use strict';

var passport = require('passport');
var authCtrl = require('./controllers/auth');
var userCtrl = require('./controllers/user');
var path = require('path');

module.exports = function (app) {

  // routes for sign in, sigin up
  app.post('/signin', authCtrl.issueAccessToken);
  app.post('/signup', authCtrl.signup);

  // Restful api routes
  
  app.post('/api/access_token', authCtrl.issueAccessToken);

  // secured api routes (requires access token)
  app.all('/api/*', authCtrl.bearerAuth);
  app.get('/api/me', authCtrl.requiresAuth, userCtrl.getMe);
  app.get('/api/users', authCtrl.requiresAuth, userCtrl.list);

  // serve index.html for all other route
  app.all('/*', function (req, res) { 
    res.sendfile(path.join(__dirname,'../public/views/index.html'));
  }); 
};
