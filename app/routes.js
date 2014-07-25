
/**
 * app/routes.js
 */

'use strict';

var passport = require('passport');
var auth = require('../config/middlewares/authorization');
var authCtrl = require('./controllers/auth');
var userCtrl = require('./controllers/user');
var path = require('path');

module.exports = function (app) {

  // routes for sign in,  sigin up, and signout processes
  app.post('/signin', authCtrl.issueAccessToken);
  app.post('/signup', authCtrl.signup);

  // secured restful api routes
  app.all('/api/*', authCtrl.bearerAuth);

  app.get('/api/users', auth.requiresAuth, userCtrl.list);

  // serve index.html for all other route
  app.all('/*', function (req, res) { 
    res.sendfile(path.join(__dirname,'../public/index.html'));
  }); 
};
