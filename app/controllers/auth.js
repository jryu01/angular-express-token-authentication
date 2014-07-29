
/*
* app/controllers/auth.js
*/

'use strict';

var passport = require('passport');
var jwt = require('jwt-simple');
var config = require('../../config/config');
var User = require('../models/user');

function bearerAuth(req, res, next) {
  passport.authenticate('bearer', { session: false }, 
  function(err, user, info) {
    if (err) return next(err);
    if (!req.query.access_token) {
      return res.send(401, {
        message: "Unauthorized - access_token must be provided"
      });
    }
    if (!user) {
      return res.send(401, { 
        message: "Access token has expired or is invalid" 
      });
    }
    // login user and proceed to next
    req.login(user, { session: false }, function (err) {
      if (err) return next(err);
      next();
    });
  })(req, res, next);
}

function issueTokenWithUid(uid) {

  var curDate = new Date();
  // expires in 60 days 
  var expires = new Date(curDate.getTime() + (60*24*60*60*1000));

  var token = jwt.encode({
    iss: uid, // issuer
    exp: expires.getTime() // expiration time
  }, config.jwtsecret);

  return token;
}

function issueAccessToken(req, res) {

  // Exchange token by email and password
  if (req.body.email && req.body.password) {
    User.
      findOne({ 'local.email': req.body.email }, function (err, user) {
        if (err) { return res.send(500, err); }
        if (!user) {
          return res.send(401, { message: 'Unknown email'});
        }
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (err) { return res.send(500, err); }
          if(!isMatch) {
            return res.send(401, { message: 'Invalid password.' });
          }

          // issue a token
          var token = issueTokenWithUid(user.id);

          return res.send({ access_token: token, user: user });
        });
      }); 

  //Exchange token with 3rd party acess token
  } else if (req.body.provider && req.body.access_token) {

  } else {
    return res.send(400, 'Missing credentials');
  }

}

function signup(req, res, next) {

  var email = req.body.email;
  var password = req.body.password;

  // validate email and password
  if(!email || !email.length) {
    return res.send(400, { message: 'email is not valid' });
  }
  if(!password || !password.length) {
    return res.send(400, { message: 'password is not valid' });
  }
  
  User.findOne({ 'local.email': email }, function (err, user) {
    if (err) { return next(err); }

    // check if user is already exists
    if (user) {
      return res.send(409, { message: 'the email is already taken.' });
    }

    // create and save a new user
    user = new User();
    user.local.email = email;
    user.local.password = password;

    user.save(function (err, user) {
      if (err) { return next(err); }

      // issue a token
      var token = issueTokenWithUid(user.id);

      return res.send({ access_token: token, user: user });
    });
  });
}

// public functions and variables 
exports.issueAccessToken = issueAccessToken;
exports.bearerAuth = bearerAuth;
exports.signup = signup;