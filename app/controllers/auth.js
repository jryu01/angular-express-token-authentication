
/*
* app/controllers/auth.js
*/

'use strict';

var passport = require('passport');
var jwt = require('jwt-simple');
var https = require('https');
var _ = require('lodash');
var request = require('request');
var config = require('../../config/config');
var User = require('../models/user');

///////////////////////////////////////////////////////////////////////////////
// Middlewares
///////////////////////////////////////////////////////////////////////////////

// bearerAuth middleware
function bearerAuth(req, res, next) {
  passport.authenticate('bearer', { session: false }, 
  function(err, user, info) {
    if (err) return next(err);
    if (!req.query.access_token) {
      return res.send(400, {
        message: "An access token must be provided"
      });
    }
    if (!user) {
      return res.send(401, { 
        message: "Access token has expired or is invalid" 
      });
    }
    // login user and proceed to next
    // console.log(req.login.toString());
    req.user = user;
    next();
    // req.login(user, { session: false }, function (err) {
    //   if (err) return next(err);
    //   next();
    // });
  })(req, res, next);
}

// generic require signin middleware
function requiresAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.send(401, { message: "requires authentication"});
  }
  next();
}

///////////////////////////////////////////////////////////////////////////////

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

  //Exchange 3rd party acess token with users access token (for now, facebook only)
  } else if (req.body.grantType && req.body.token) {
    if (req.body.grantType === "facebook_token") {

      getFacebookProfile(req.body.token, function (err, profile) {
        if (err) { return res.send(500, err); }

        // find a user with facebook id and create one 
        // if does not already exist
        User.findOne({'facebook.id': profile.id}, function (err, user) {
          if (err) { return res.send(500, err); }
          if (user) {
            // issue a token
            var token = issueTokenWithUid(user.id);
            return res.send({ access_token: token, user: user });
          } 
          if (!user) {
            // create a new user
            user = new User();

            user.facebook.id = profile.id;
            user.facebook.name = (profile.first_name || "") + 
                                ' ' + (profile.last_name || "");
            user.facebook.name = user.facebook.name.trim();
            user.facebook.email = profile.email;
            user.facebook.accessToken = req.body.token;
            user.facebook.profilePic = profile.profilePic.url;

            //save user and issue a token
            user.save(function (err) {
              if (err) { return res.send(500, err); }
              // issue a token
              var token = issueTokenWithUid(user.id);
              return res.send({ access_token: token, user: user });
            });
          }
        });
      });
    } else {
      return res.send(400, 'Unsupported grant type');
    }
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


///////////////////////////////////////////////////////////////////////////////
// Helpers
///////////////////////////////////////////////////////////////////////////////
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
function getFacebookProfile(fbToken, callback) {

  // get facebook profile and picture with provided token
  var url = "https://graph.facebook.com/me?access_token=" + fbToken;
  var picUrl = "https://graph.facebook.com/me/" + 
      "picture?redirect=false&access_token=" + fbToken;

  var profile = null;
  var profilePic = null;
  var requestFail = false;

  // excute callback after being called 2 times (after getting profile and pic)
  var done = _.after(2, function () {
    if (requestFail) {
      var err = {
        message: 'fail to get facebook profile'
      };
      return callback(err, null);
    }
    profile.profilePic = profilePic.data;
    return callback(null, profile);
  });

  // get profile
  request(url, function (error, response, body) {
    if(!error && response.statusCode === 200) {
      profile = JSON.parse(body);
    } else {
      requestFail = true;
    }
    done();
  });
  // get profile picture url
  request(picUrl, function (error, response, body) {
    if(!error && response.statusCode === 200) {
      profilePic = JSON.parse(body);
    } else {
      requestFail = true;
    }
    done();
  });
}

// public functions and variables 
exports.issueAccessToken = issueAccessToken;
exports.bearerAuth = bearerAuth;
exports.requiresAuth = requiresAuth;
exports.signup = signup;