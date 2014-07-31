
/*
* app/controllers/auth.js
*/

'use strict';

var passport = require('passport');
var jwt = require('jwt-simple');
var config = require('../../config/config');
var User = require('../models/user');
var https = require('https');
var _ = require('lodash');

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

  //Exchange token with 3rd party acess token (for now, facebook only)
  } else if (req.body.grantType && req.body.token) {
    if (req.body.grantType !== "facebook_token") {
      return res.send(400);
    }
    // get facebook profile and picture with provided token

    var fbToken = req.body.token;
    var url = "https://graph.facebook.com/me?access_token=" + fbToken;
    var picUrl = "https://graph.facebook.com/me/" + 
        "picture?redirect=false&access_token=" + fbToken;

    var profile = null;
    var profilePic = null;

    // call after getting profile and profile pic
    var done = _.after(2, function () {
      
      // find a user with facebook id and create one if does not already exist
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
          user.facebook.accessToken = fbToken;
          if (profilePic.data) {
            user.facebook.profilePic = profilePic.data.url;
          }

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

    // get profile
    https.get(url, function (res) {
      var data = "";
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        profile = JSON.parse(data);
        done(); 
      });
    });

    // get profile picture url
    https.get(picUrl, function (res) {
      var data = "";
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        profilePic = JSON.parse(data);
        done();
      });
    });

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


// Helpers
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

// public functions and variables 
exports.issueAccessToken = issueAccessToken;
exports.bearerAuth = bearerAuth;
exports.signup = signup;