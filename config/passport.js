/**
 * config/passport.js
 * passport configuration file
 */

'use strict';

var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jwt-simple');
var User = require('../app/models/user');

module.exports = function (passport, config) {

  // Bearer Strategy for token authentication
  passport.use(new BearerStrategy(
  function (token, done) {

    var decoded = jwt.decode(token, config.jwtsecret);

    if (decoded.exp <= Date.now()) {
      return done(null, false, {
        message: 'Access token has expired' 
      });
    }

    User.findById(decoded.iss, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user);
    });
  }));
};