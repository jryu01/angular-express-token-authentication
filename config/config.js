/**
 * configuration file
 *
 */

'use strict';

var path = require('path');
var _ = require('lodash');
var env = process.env.NODE_ENV || 'development'; // env variable
var rootPath = path.normalize(__dirname + '/..');

function getConfig (env) {

  var config = {};

  config.all =  {
    root: rootPath,
    port: process.env.PORT || 3000,
    mongo: {},
    app: {
      name: "angular-express-token-authentication"
    },
    jwtsecret: 'thisisjwtsecret'
  };

  // Development configuration
  config.development = {
    env: "development",
    mongo: {
      url: "mongodb://localhost/token-auth"
    },
    facebook: {
      clientID: "481914391941067",
      clientSecret: "0a1cb8b41c20ed13490b1ea494e5ec03",
      callbackURL: "http://localhost:3000/auth/facebook/callback" 
    }
  };

  // Test configuration
  config.test = {

  };

  // Production configuration
  config.production = {

  };
  return _.merge(config.all, config[env]);
}

module.exports = getConfig(env);